"""
Tests for the plan_tasks module
"""

import pytest
import json
import tempfile
from pathlib import Path
from datetime import datetime, timedelta

from digby.core.plan_tasks import TaskPlanner, Goal, Milestone, Task


@pytest.fixture
def sample_goal():
    """Sample goal for testing"""
    tasks = [
        Task(
            id="test_task_1",
            title="Test Task 1",
            description="First test task",
            estimated_hours=4,
            priority="high",
            status="pending",
            tags=["test"]
        ),
        Task(
            id="test_task_2", 
            title="Test Task 2",
            description="Second test task",
            estimated_hours=2,
            priority="medium",
            status="pending",
            tags=["test"]
        )
    ]
    
    milestone = Milestone(
        id="test_milestone_1",
        title="Test Milestone",
        description="Test milestone description",
        deadline="2024-12-31",
        status="pending",
        tasks=tasks
    )
    
    return Goal(
        id="test_goal_1",
        title="Test Goal",
        description="A test goal for unit testing",
        priority="high",
        deadline="2024-12-31", 
        status="active",
        milestones=[milestone]
    )


@pytest.fixture
def temp_goals_file(sample_goal):
    """Create temporary goals file for testing"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        data = {
            "goals": [sample_goal.model_dump()],
            "metadata": {
                "version": "1.0",
                "last_updated": datetime.now().isoformat(),
                "created_by": "test"
            }
        }
        json.dump(data, f, indent=2)
        f.flush()  # Ensure data is written to disk
        temp_file_path = f.name
    
    yield temp_file_path
    
    # Cleanup
    Path(temp_file_path).unlink(missing_ok=True)


class TestTaskPlanner:
    """Test cases for TaskPlanner class"""
    
    def test_init_with_existing_file(self, temp_goals_file):
        """Test initialization with existing goals file"""
        planner = TaskPlanner(temp_goals_file)
        assert len(planner.goals) == 1
        assert planner.goals[0].title == "Test Goal"
    
    def test_init_with_nonexistent_file(self):
        """Test initialization with non-existent goals file"""
        planner = TaskPlanner("nonexistent.json")
        assert len(planner.goals) == 0
    
    def test_add_goal(self, sample_goal, temp_goals_file):
        """Test adding a new goal"""
        planner = TaskPlanner(temp_goals_file)
        initial_count = len(planner.goals)
        
        new_goal = Goal(
            id="new_test_goal",
            title="New Test Goal", 
            description="A new test goal",
            priority="medium",
            deadline="2024-12-31",
            status="active",
            milestones=[]
        )
        
        planner.add_goal(new_goal)
        assert len(planner.goals) == initial_count + 1
    
    def test_get_active_goals(self, temp_goals_file):
        """Test getting active goals"""
        planner = TaskPlanner(temp_goals_file)
        active_goals = planner.get_active_goals()
        assert len(active_goals) == 1
        assert active_goals[0].status == "active"
    
    def test_get_pending_tasks(self, temp_goals_file):
        """Test getting pending tasks"""
        planner = TaskPlanner(temp_goals_file)
        pending_tasks = planner.get_pending_tasks()
        assert len(pending_tasks) == 2
        
        task, goal_title, milestone_title = pending_tasks[0]
        assert task.status == "pending"
        assert goal_title == "Test Goal"
        assert milestone_title == "Test Milestone"
    
    def test_get_tasks_by_priority(self, temp_goals_file):
        """Test grouping tasks by priority"""
        planner = TaskPlanner(temp_goals_file)
        tasks_by_priority = planner.get_tasks_by_priority()
        
        assert len(tasks_by_priority["high"]) == 1
        assert len(tasks_by_priority["medium"]) == 1
        assert len(tasks_by_priority["low"]) == 0
        assert len(tasks_by_priority["urgent"]) == 0
    
    def test_generate_weekly_schedule(self, temp_goals_file):
        """Test weekly schedule generation"""
        planner = TaskPlanner(temp_goals_file)
        schedule = planner.generate_weekly_schedule()
        
        assert len(schedule) > 0
        assert schedule[0].task_id in ["test_task_1", "test_task_2"]
        assert schedule[0].day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    
    def test_update_task_status(self, temp_goals_file):
        """Test updating task status"""
        planner = TaskPlanner(temp_goals_file)
        
        # Update existing task
        result = planner.update_task_status("test_task_1", "completed")
        assert result is True
        
        # Try to update non-existent task
        result = planner.update_task_status("nonexistent_task", "completed")
        assert result is False
    
    def test_get_goal_progress(self, temp_goals_file):
        """Test getting goal progress statistics"""
        planner = TaskPlanner(temp_goals_file)
        
        # Mark one task as completed
        planner.update_task_status("test_task_1", "completed")
        
        progress = planner.get_goal_progress("test_goal_1")
        
        assert progress["total_tasks"] == 2
        assert progress["completed_tasks"] == 1
        assert progress["progress_percentage"] == 50.0
        assert progress["goal_title"] == "Test Goal"
    
    def test_get_weekly_summary(self, temp_goals_file):
        """Test getting weekly summary"""
        planner = TaskPlanner(temp_goals_file)
        summary = planner.get_weekly_summary()
        
        assert summary["total_pending_tasks"] == 2
        assert summary["active_goals"] == 1
        assert summary["total_estimated_hours"] == 6  # 4 + 2 hours


class TestDataModels:
    """Test cases for data models"""
    
    def test_task_model_validation(self):
        """Test Task model validation"""
        task = Task(
            id="test_task",
            title="Test Task",
            description="Test description",
            estimated_hours=5,
            priority="high",
            status="pending",
            tags=["test", "validation"]
        )
        
        assert task.id == "test_task"
        assert task.title == "Test Task"
        assert task.priority == "high"
        assert task.status == "pending"
        assert len(task.tags) == 2
    
    def test_task_model_invalid_priority(self):
        """Test Task model with invalid priority"""
        with pytest.raises(ValueError):
            Task(
                id="test_task",
                title="Test Task", 
                description="Test description",
                estimated_hours=5,
                priority="invalid_priority",  # This should fail validation
                status="pending"
            )
    
    def test_milestone_model(self):
        """Test Milestone model"""
        milestone = Milestone(
            id="test_milestone",
            title="Test Milestone",
            description="Test milestone description",
            deadline="2024-12-31",
            status="pending",
            tasks=[]
        )
        
        assert milestone.id == "test_milestone"
        assert milestone.title == "Test Milestone"
        assert len(milestone.tasks) == 0
    
    def test_goal_model(self):
        """Test Goal model"""
        goal = Goal(
            id="test_goal",
            title="Test Goal",
            description="Test goal description",
            priority="high",
            deadline="2024-12-31",
            status="active",
            milestones=[]
        )
        
        assert goal.id == "test_goal"
        assert goal.title == "Test Goal"
        assert goal.priority == "high"
        assert goal.status == "active"
        assert len(goal.milestones) == 0