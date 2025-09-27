#!/usr/bin/env python3
"""
Demo script showing Digby Virtual Assistant capabilities
"""

from digby.core.plan_tasks import TaskPlanner, Goal, Milestone, Task
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

def create_demo_goal():
    """Create a demo goal with tasks"""
    
    # Create sample tasks
    tasks = [
        Task(
            id="python_basics",
            title="Learn Python Basics",
            description="Study Python syntax, data types, and control structures",
            estimated_hours=8,
            priority="high",
            status="pending",
            tags=["learning", "programming", "python"]
        ),
        Task(
            id="web_scraping",
            title="Build Web Scraper",
            description="Create a web scraper using Beautiful Soup",
            estimated_hours=6,
            priority="medium",
            status="pending",
            tags=["project", "scraping", "python"]
        ),
        Task(
            id="data_analysis",
            title="Data Analysis Project",
            description="Analyze dataset using pandas and matplotlib",
            estimated_hours=10,
            priority="high",
            status="pending",
            tags=["data", "analysis", "visualization"]
        )
    ]
    
    # Create milestone
    milestone = Milestone(
        id="python_foundation",
        title="Python Programming Foundation",
        description="Build solid foundation in Python programming",
        deadline="2024-06-30",
        status="pending",
        tasks=tasks
    )
    
    # Create goal
    goal = Goal(
        id="become_python_developer",
        title="Become Python Developer",
        description="Master Python programming for career advancement",
        priority="high",
        deadline="2024-12-31",
        status="active",
        milestones=[milestone]
    )
    
    return goal

def demo_digby():
    """Demonstrate Digby's capabilities"""
    
    console.print(Panel.fit("[bold blue]🤖 Digby Virtual Assistant Demo[/bold blue]", style="blue"))
    
    # Create task planner with demo data
    planner = TaskPlanner("demo_goals.json")
    
    # Add demo goal
    demo_goal = create_demo_goal()
    planner.add_goal(demo_goal)
    
    console.print("\n[green]✅ Added demo goal: 'Become Python Developer'[/green]")
    
    # Show active goals
    console.print("\n[bold]📋 Active Goals:[/bold]")
    goals = planner.get_active_goals()
    
    table = Table()
    table.add_column("Goal", style="cyan")
    table.add_column("Priority", style="magenta")
    table.add_column("Deadline", style="green")
    table.add_column("Tasks", justify="right", style="blue")
    
    for goal in goals:
        total_tasks = sum(len(m.tasks) for m in goal.milestones)
        table.add_row(goal.title, goal.priority, goal.deadline, str(total_tasks))
    
    console.print(table)
    
    # Generate weekly schedule
    console.print("\n[bold]📅 Weekly Schedule:[/bold]")
    schedule = planner.generate_weekly_schedule()
    
    if schedule:
        schedule_table = Table()
        schedule_table.add_column("Day", style="green")
        schedule_table.add_column("Time", style="blue")
        schedule_table.add_column("Task", style="cyan")
        schedule_table.add_column("Hours", justify="right", style="magenta")
        schedule_table.add_column("Priority", style="yellow")
        
        for item in schedule:
            schedule_table.add_row(
                item.day,
                item.time_slot,
                item.title,
                str(item.estimated_hours),
                item.priority
            )
        
        console.print(schedule_table)
    else:
        console.print("[yellow]No tasks scheduled for this week.[/yellow]")
    
    # Show progress
    console.print("\n[bold]📊 Progress Summary:[/bold]")
    summary = planner.get_weekly_summary()
    
    info_table = Table.grid(padding=1)
    info_table.add_column(style="bold blue")
    info_table.add_column()
    
    info_table.add_row("Active Goals:", str(summary['active_goals']))
    info_table.add_row("Pending Tasks:", str(summary['total_pending_tasks']))
    info_table.add_row("Estimated Hours:", str(summary['total_estimated_hours']))
    
    console.print(info_table)
    
    # Show what AI capabilities would provide
    console.print("\n[bold]🧠 AI-Powered Features (with Google API key):[/bold]")
    ai_features = [
        "🎯 Intelligent goal decomposition into milestones and tasks",
        "📈 Personalized weekly advice and optimization tips",
        "💬 Natural language chat for planning assistance",
        "🎉 Motivational messages based on your progress",
        "🔍 Smart task prioritization and scheduling",
    ]
    
    for feature in ai_features:
        console.print(f"  {feature}")
    
    console.print(Panel(
        "[bold green]Demo completed! 🎉[/bold green]\n\n"
        "To use Digby with full AI capabilities:\n"
        "1. Get a free Google API key from https://makersuite.google.com/app/apikey\n"
        "2. Run: [cyan]digby setup[/cyan]\n"
        "3. Start planning: [cyan]digby add-goal 'Your goal here' -d 2024-12-31[/cyan]",
        title="Next Steps",
        style="green"
    ))

if __name__ == "__main__":
    demo_digby()