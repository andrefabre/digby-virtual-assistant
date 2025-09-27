"""
Task Planning Module for Digby Virtual Assistant

This module handles hierarchical task planning:
Goal -> Year -> Month -> Week -> Day breakdown
"""

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

from pydantic import BaseModel, Field


# Data Models
class Task(BaseModel):
    """Individual task model"""

    id: str
    title: str
    description: str
    estimated_hours: int
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    status: str = Field(
        default="pending", pattern="^(pending|in_progress|completed|cancelled)$"
    )
    tags: List[str] = Field(default_factory=list)
    due_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class Milestone(BaseModel):
    """Milestone model containing multiple tasks"""

    id: str
    title: str
    description: str
    deadline: str
    status: str = Field(
        default="pending", pattern="^(pending|in_progress|completed|cancelled)$"
    )
    tasks: List[Task] = Field(default_factory=list)


class Goal(BaseModel):
    """Top-level goal model"""

    id: str
    title: str
    description: str
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    deadline: str
    status: str = Field(
        default="active", pattern="^(active|completed|paused|cancelled)$"
    )
    milestones: List[Milestone] = Field(default_factory=list)


@dataclass
class WeeklyScheduleItem:
    """Item in a weekly schedule"""

    task_id: str
    title: str
    day: str
    time_slot: str
    estimated_hours: int
    priority: str
    goal_title: str


class TaskPlanner:
    """
    Core task planning engine for Digby Virtual Assistant.

    Handles hierarchical breakdown of goals into actionable tasks
    and generates balanced weekly schedules.
    """

    def __init__(self, goals_file: str = "goals.json"):
        self.goals_file = Path(goals_file)
        self.logger = logging.getLogger(__name__)
        self.goals: List[Goal] = []
        self.load_goals()

    def load_goals(self) -> None:
        """Load goals from JSON file"""
        try:
            if self.goals_file.exists():
                with open(self.goals_file, "r") as f:
                    data = json.load(f)
                    self.goals = [Goal(**goal) for goal in data.get("goals", [])]
                self.logger.info(
                    f"Loaded {len(self.goals)} goals from {self.goals_file}"
                )
            else:
                self.logger.warning(
                    f"Goals file {self.goals_file} not found. Starting with empty goals."
                )
                self.goals = []
        except Exception as e:
            self.logger.error(f"Error loading goals: {e}")
            self.goals = []

    def save_goals(self) -> None:
        """Save goals to JSON file"""
        try:
            data = {
                "goals": [goal.model_dump() for goal in self.goals],
                "metadata": {
                    "version": "1.0",
                    "last_updated": datetime.now().isoformat(),
                    "created_by": "digby",
                },
            }
            with open(self.goals_file, "w") as f:
                json.dump(data, f, indent=2)
            self.logger.info(f"Saved {len(self.goals)} goals to {self.goals_file}")
        except Exception as e:
            self.logger.error(f"Error saving goals: {e}")

    def add_goal(self, goal: Goal) -> None:
        """Add a new goal"""
        self.goals.append(goal)
        self.save_goals()
        self.logger.info(f"Added new goal: {goal.title}")

    def get_active_goals(self) -> List[Goal]:
        """Get all active goals"""
        return [goal for goal in self.goals if goal.status == "active"]

    def get_pending_tasks(self) -> List[tuple[Task, str, str]]:
        """Get all pending tasks with their goal and milestone context"""
        pending_tasks = []
        for goal in self.get_active_goals():
            for milestone in goal.milestones:
                if milestone.status in ["pending", "in_progress"]:
                    for task in milestone.tasks:
                        if task.status == "pending":
                            pending_tasks.append((task, goal.title, milestone.title))
        return pending_tasks

    def get_tasks_by_priority(self) -> Dict[str, List[tuple[Task, str, str]]]:
        """Group pending tasks by priority"""
        tasks_by_priority = {"urgent": [], "high": [], "medium": [], "low": []}
        for task, goal_title, milestone_title in self.get_pending_tasks():
            tasks_by_priority[task.priority].append((task, goal_title, milestone_title))
        return tasks_by_priority

    def generate_weekly_schedule(
        self,
        start_date: Optional[datetime] = None,
        hours_per_day: int = 6,
        work_days: List[str] = None,
    ) -> List[WeeklyScheduleItem]:
        """
        Generate a balanced weekly schedule from pending tasks.

        Args:
            start_date: Start date for the week (defaults to next Monday)
            hours_per_day: Available working hours per day
            work_days: List of working days (defaults to Mon-Fri)

        Returns:
            List of scheduled items for the week
        """
        if start_date is None:
            # Default to next Monday
            today = datetime.now()
            days_ahead = 0 - today.weekday()  # Monday is 0
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
            start_date = today + timedelta(days_ahead)

        if work_days is None:
            work_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

        # Get tasks prioritized
        tasks_by_priority = self.get_tasks_by_priority()

        # Calculate available hours for the week
        total_hours = len(work_days) * hours_per_day

        # Create schedule slots
        schedule = []
        day_hours = {day: 0 for day in work_days}

        # Time slots for scheduling
        time_slots = [
            "09:00-10:00",
            "10:00-11:00",
            "11:00-12:00",
            "13:00-14:00",
            "14:00-15:00",
            "15:00-16:00",
            "16:00-17:00",
            "17:00-18:00",
        ]

        # Schedule tasks by priority
        for priority in ["urgent", "high", "medium", "low"]:
            for task, goal_title, milestone_title in tasks_by_priority[priority]:
                # Find best day for this task
                available_days = [
                    day
                    for day in work_days
                    if day_hours[day] + task.estimated_hours <= hours_per_day
                ]

                if available_days:
                    # Choose day with least hours scheduled
                    best_day = min(available_days, key=lambda d: day_hours[d])

                    # Schedule the task
                    start_hour = day_hours[best_day]
                    if start_hour < len(time_slots):
                        time_slot = time_slots[start_hour]

                        schedule_item = WeeklyScheduleItem(
                            task_id=task.id,
                            title=task.title,
                            day=best_day,
                            time_slot=time_slot,
                            estimated_hours=task.estimated_hours,
                            priority=task.priority,
                            goal_title=goal_title,
                        )

                        schedule.append(schedule_item)
                        day_hours[best_day] += task.estimated_hours

                        # Break if we've filled the week
                        if sum(day_hours.values()) >= total_hours:
                            break

            if sum(day_hours.values()) >= total_hours:
                break

        return schedule

    def update_task_status(self, task_id: str, new_status: str) -> bool:
        """Update the status of a specific task"""
        for goal in self.goals:
            for milestone in goal.milestones:
                for task in milestone.tasks:
                    if task.id == task_id:
                        task.status = new_status
                        self.save_goals()
                        self.logger.info(
                            f"Updated task {task_id} status to {new_status}"
                        )
                        return True
        return False

    def get_goal_progress(self, goal_id: str) -> Dict[str, Any]:
        """Calculate progress statistics for a goal"""
        goal = next((g for g in self.goals if g.id == goal_id), None)
        if not goal:
            return {}

        total_tasks = 0
        completed_tasks = 0
        total_hours = 0
        completed_hours = 0

        for milestone in goal.milestones:
            for task in milestone.tasks:
                total_tasks += 1
                total_hours += task.estimated_hours

                if task.status == "completed":
                    completed_tasks += 1
                    completed_hours += task.estimated_hours

        progress_percentage = (
            (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        )

        return {
            "goal_title": goal.title,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress_percentage": round(progress_percentage, 2),
            "total_hours": total_hours,
            "completed_hours": completed_hours,
            "milestones": len(goal.milestones),
            "status": goal.status,
        }

    def get_weekly_summary(self) -> Dict[str, Any]:
        """Get a summary of the current week's progress"""
        pending_tasks = self.get_pending_tasks()
        tasks_by_priority = self.get_tasks_by_priority()

        return {
            "total_pending_tasks": len(pending_tasks),
            "tasks_by_priority": {
                priority: len(tasks) for priority, tasks in tasks_by_priority.items()
            },
            "active_goals": len(self.get_active_goals()),
            "total_estimated_hours": sum(
                task[0].estimated_hours for task in pending_tasks
            ),
        }
