"""
Digby Agent - AI-powered Virtual Assistant

Uses Google Gemini for intelligent goal decomposition and task planning.
"""

import os
import logging
from typing import List, Dict, Any, Optional

import google.generativeai as genai
from langchain.schema import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from ..core.plan_tasks import TaskPlanner, Goal, Milestone, Task


class DigbyAgent:
    """
    AI-powered virtual assistant using Google Gemini for intelligent planning.

    Capabilities:
    - Goal decomposition into milestones and tasks
    - Weekly schedule optimization
    - Progress tracking and motivation
    - Natural language interaction
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        goals_file: str = "goals.json",
        model_name: str = "gemini-pro",
    ):
        self.logger = logging.getLogger(__name__)

        # Initialize API key
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Google API key is required. Set GOOGLE_API_KEY environment variable."
            )

        # Configure Gemini
        genai.configure(api_key=self.api_key)

        # Initialize LangChain with Gemini
        self.llm = ChatGoogleGenerativeAI(
            model=model_name, google_api_key=self.api_key, temperature=0.7
        )

        # Initialize task planner
        self.task_planner = TaskPlanner(goals_file)

        self.logger.info("Digby Agent initialized successfully")

    def decompose_goal(
        self, goal_description: str, deadline: str, priority: str = "medium"
    ) -> Goal:
        """
        Use AI to decompose a high-level goal into milestones and tasks.

        Args:
            goal_description: Natural language description of the goal
            deadline: Target completion date
            priority: Goal priority (low, medium, high, urgent)

        Returns:
            Goal object with AI-generated milestones and tasks
        """

        prompt = f"""
        As Digby, an intelligent virtual assistant, help decompose this goal into actionable milestones and tasks.
        
        Goal: {goal_description}
        Deadline: {deadline}
        Priority: {priority}
        
        Please break this down following this structure:
        1. Create 2-4 logical milestones that lead to achieving this goal
        2. For each milestone, create 3-6 specific, actionable tasks
        3. Estimate hours for each task (be realistic: 1-20 hours per task)
        4. Assign priority to each task based on dependencies and importance
        5. Add relevant tags to categorize tasks
        
        Format your response as a structured breakdown that I can parse.
        Use this format:
        
        GOAL_TITLE: [concise title]
        GOAL_ID: [snake_case_id]
        
        MILESTONE 1:
        Title: [milestone title]
        ID: [milestone_id]
        Deadline: [YYYY-MM-DD]
        Description: [milestone description]
        
        TASK 1.1:
        Title: [task title]
        ID: [task_id]
        Description: [detailed description]
        Hours: [estimated hours]
        Priority: [low/medium/high/urgent]
        Tags: [tag1, tag2, tag3]
        
        TASK 1.2:
        [continue pattern...]
        
        MILESTONE 2:
        [continue pattern...]
        
        Make sure the breakdown is logical, actionable, and achievable within the given timeframe.
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])

            # Parse the AI response into a Goal object
            goal = self._parse_goal_response(
                response.content, goal_description, deadline, priority
            )

            self.logger.info(f"Successfully decomposed goal: {goal.title}")
            return goal

        except Exception as e:
            self.logger.error(f"Error decomposing goal: {e}")
            # Fallback: create a basic goal structure
            return self._create_fallback_goal(goal_description, deadline, priority)

    def _parse_goal_response(
        self,
        response_text: str,
        original_description: str,
        deadline: str,
        priority: str,
    ) -> Goal:
        """Parse AI response into Goal object"""

        lines = response_text.strip().split("\n")

        # Extract goal information
        goal_title = (
            original_description[:50] + "..."
            if len(original_description) > 50
            else original_description
        )
        goal_id = goal_title.lower().replace(" ", "_").replace(".", "")[:30]

        # Parse milestones and tasks
        milestones = []
        current_milestone = None
        current_tasks = []

        for line in lines:
            line = line.strip()

            if line.startswith("GOAL_TITLE:"):
                goal_title = line.replace("GOAL_TITLE:", "").strip()
            elif line.startswith("GOAL_ID:"):
                goal_id = line.replace("GOAL_ID:", "").strip()
            elif line.startswith("MILESTONE"):
                # Save previous milestone if exists
                if current_milestone:
                    current_milestone["tasks"] = current_tasks
                    milestones.append(Milestone(**current_milestone))
                    current_tasks = []

                # Start new milestone
                current_milestone = {
                    "id": f"{goal_id}_milestone_{len(milestones) + 1}",
                    "title": "Milestone",
                    "description": "Auto-generated milestone",
                    "deadline": deadline,
                    "status": "pending",
                }
            elif line.startswith("Title:") and current_milestone:
                current_milestone["title"] = line.replace("Title:", "").strip()
            elif line.startswith("Description:") and current_milestone:
                current_milestone["description"] = line.replace(
                    "Description:", ""
                ).strip()
            elif line.startswith("TASK"):
                # Start new task
                current_task = {
                    "id": f"task_{len(current_tasks) + 1}",
                    "title": "Task",
                    "description": "Auto-generated task",
                    "estimated_hours": 4,
                    "priority": "medium",
                    "status": "pending",
                    "tags": [],
                }
                current_tasks.append(Task(**current_task))

        # Save last milestone
        if current_milestone:
            current_milestone["tasks"] = current_tasks
            milestones.append(Milestone(**current_milestone))

        # If no milestones were parsed, create a default one
        if not milestones:
            milestones = [self._create_default_milestone(goal_id, deadline)]

        return Goal(
            id=goal_id,
            title=goal_title,
            description=original_description,
            priority=priority,
            deadline=deadline,
            status="active",
            milestones=milestones,
        )

    def _create_fallback_goal(
        self, description: str, deadline: str, priority: str
    ) -> Goal:
        """Create a basic goal structure when AI parsing fails"""

        goal_id = description.lower().replace(" ", "_")[:30]

        # Create a simple milestone with basic tasks
        milestone = self._create_default_milestone(goal_id, deadline)

        return Goal(
            id=goal_id,
            title=description[:100],
            description=description,
            priority=priority,
            deadline=deadline,
            status="active",
            milestones=[milestone],
        )

    def _create_default_milestone(self, goal_id: str, deadline: str) -> Milestone:
        """Create a default milestone with sample tasks"""

        tasks = [
            Task(
                id=f"{goal_id}_task_1",
                title="Research and Planning",
                description="Gather information and create a detailed plan",
                estimated_hours=4,
                priority="high",
                status="pending",
                tags=["research", "planning"],
            ),
            Task(
                id=f"{goal_id}_task_2",
                title="Implementation Phase 1",
                description="Begin implementation of the main components",
                estimated_hours=8,
                priority="medium",
                status="pending",
                tags=["implementation", "development"],
            ),
            Task(
                id=f"{goal_id}_task_3",
                title="Review and Refinement",
                description="Review progress and refine approach",
                estimated_hours=3,
                priority="medium",
                status="pending",
                tags=["review", "refinement"],
            ),
        ]

        return Milestone(
            id=f"{goal_id}_milestone_1",
            title="Main Implementation",
            description="Primary milestone for achieving this goal",
            deadline=deadline,
            status="pending",
            tasks=tasks,
        )

    def generate_weekly_advice(self, schedule_items: List) -> str:
        """Generate AI-powered advice for the weekly schedule"""

        if not schedule_items:
            return "No tasks scheduled for this week. Consider adding some goals to get started!"

        # Prepare schedule summary for AI
        schedule_summary = []
        for item in schedule_items:
            schedule_summary.append(
                f"- {item.day}: {item.title} ({item.estimated_hours}h, {item.priority} priority)"
            )

        prompt = f"""
        As Digby, your personal AI assistant, analyze this weekly schedule and provide helpful advice:
        
        Weekly Schedule:
        {chr(10).join(schedule_summary)}
        
        Please provide:
        1. Overall assessment of the workload balance
        2. Suggestions for optimizing productivity
        3. Potential challenges to watch out for
        4. Motivational advice
        5. Tips for staying on track
        
        Keep the advice practical, encouraging, and personalized. Limit to 200 words.
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            self.logger.error(f"Error generating weekly advice: {e}")
            return "Focus on your high-priority tasks first and maintain a steady pace throughout the week!"

    def get_motivational_message(self, progress_stats: Dict[str, Any]) -> str:
        """Generate a motivational message based on progress"""

        prompt = f"""
        As Digby, provide a motivational message based on these progress statistics:
        
        Progress Stats:
        - Completed Tasks: {progress_stats.get('completed_tasks', 0)}
        - Total Tasks: {progress_stats.get('total_tasks', 0)}
        - Progress: {progress_stats.get('progress_percentage', 0)}%
        - Active Goals: {progress_stats.get('active_goals', 0)}
        
        Generate a brief, encouraging message (50 words max) that acknowledges progress and motivates continued effort.
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            self.logger.error(f"Error generating motivational message: {e}")
            return "Great progress! Keep up the excellent work towards achieving your goals!"

    def chat(self, message: str) -> str:
        """
        Handle natural language conversation with the user.

        Can answer questions about goals, tasks, progress, and provide assistance.
        """

        # Get current context
        active_goals = self.task_planner.get_active_goals()
        pending_tasks = self.task_planner.get_pending_tasks()
        weekly_summary = self.task_planner.get_weekly_summary()

        context = f"""
        Current Context:
        - Active Goals: {len(active_goals)}
        - Pending Tasks: {len(pending_tasks)}
        - Total Estimated Hours: {weekly_summary.get('total_estimated_hours', 0)}
        
        Recent Goals:
        {chr(10).join([f"- {goal.title}" for goal in active_goals[:3]])}
        """

        prompt = f"""
        You are Digby, a helpful AI virtual assistant specializing in goal-oriented planning and productivity.
        
        {context}
        
        User message: {message}
        
        Please respond helpfully and conversationally. You can:
        - Answer questions about goals and tasks
        - Provide productivity advice
        - Help with planning and organization
        - Offer motivation and encouragement
        
        Keep responses concise but helpful (under 150 words).
        """

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
        except Exception as e:
            self.logger.error(f"Error in chat: {e}")
            return "I'm having trouble processing that right now. Could you try rephrasing your question?"
