"""
Command Line Interface for Digby Virtual Assistant
"""

import click
import json
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, BarColumn, TextColumn, TimeElapsedColumn
from datetime import datetime
from typing import Optional

from .agents.digby_agent import DigbyAgent
from .core.plan_tasks import TaskPlanner
from .utils.config import setup_logging, get_config


console = Console()


@click.group()
@click.option("--log-level", default="INFO", help="Logging level")
def cli(log_level: str):
    """Digby Virtual Assistant - Your AI-powered goal planning companion"""
    setup_logging(log_level)


@cli.command()
@click.argument("goal_description")
@click.option("--deadline", "-d", required=True, help="Goal deadline (YYYY-MM-DD)")
@click.option(
    "--priority",
    "-p",
    default="medium",
    type=click.Choice(["low", "medium", "high", "urgent"]),
    help="Goal priority",
)
def add_goal(goal_description: str, deadline: str, priority: str):
    """Add a new goal with AI-powered decomposition"""

    config = get_config()

    if not config["google_api_key"]:
        console.print(
            "[red]Error: Google API key not found. Please set GOOGLE_API_KEY environment variable.[/red]"
        )
        return

    try:
        with console.status("[bold green]Digby is analyzing your goal..."):
            agent = DigbyAgent(
                api_key=config["google_api_key"], goals_file=config["goals_file"]
            )

            # Use AI to decompose the goal
            goal = agent.decompose_goal(goal_description, deadline, priority)

            # Add to task planner
            agent.task_planner.add_goal(goal)

        console.print(
            f"[green]✓[/green] Successfully added goal: [bold]{goal.title}[/bold]"
        )
        console.print(f"  • Deadline: {deadline}")
        console.print(f"  • Priority: {priority}")
        console.print(f"  • Milestones: {len(goal.milestones)}")
        console.print(f"  • Total Tasks: {sum(len(m.tasks) for m in goal.milestones)}")

    except Exception as e:
        console.print(f"[red]Error adding goal: {e}[/red]")


@cli.command()
def list_goals():
    """List all active goals"""

    config = get_config()
    planner = TaskPlanner(config["goals_file"])
    goals = planner.get_active_goals()

    if not goals:
        console.print(
            "[yellow]No active goals found. Use 'digby add-goal' to create your first goal![/yellow]"
        )
        return

    table = Table(title="Active Goals")
    table.add_column("Title", style="cyan", no_wrap=True)
    table.add_column("Priority", style="magenta")
    table.add_column("Deadline", style="green")
    table.add_column("Milestones", justify="right", style="blue")
    table.add_column("Tasks", justify="right", style="blue")

    for goal in goals:
        total_tasks = sum(len(m.tasks) for m in goal.milestones)
        table.add_row(
            goal.title[:30] + "..." if len(goal.title) > 30 else goal.title,
            goal.priority,
            goal.deadline,
            str(len(goal.milestones)),
            str(total_tasks),
        )

    console.print(table)


@cli.command()
def weekly_schedule():
    """Generate and display weekly schedule"""

    config = get_config()

    try:
        planner = TaskPlanner(config["goals_file"])
        schedule = planner.generate_weekly_schedule(
            hours_per_day=config["hours_per_day"], work_days=config["work_days"]
        )

        if not schedule:
            console.print(
                "[yellow]No tasks to schedule. Add some goals first![/yellow]"
            )
            return

        # Group by day
        schedule_by_day = {}
        for item in schedule:
            if item.day not in schedule_by_day:
                schedule_by_day[item.day] = []
            schedule_by_day[item.day].append(item)

        # Display schedule
        console.print(Panel.fit("[bold blue]Weekly Schedule[/bold blue]", style="blue"))

        for day in config["work_days"]:
            if day in schedule_by_day:
                console.print(f"\n[bold green]{day}[/bold green]")

                for item in schedule_by_day[day]:
                    priority_color = {
                        "urgent": "red",
                        "high": "orange1",
                        "medium": "yellow",
                        "low": "green",
                    }.get(item.priority, "white")

                    console.print(
                        f"  {item.time_slot} - [{priority_color}]{item.title}[/{priority_color}] ({item.estimated_hours}h)"
                    )
                    console.print(f"    Goal: {item.goal_title}")
            else:
                console.print(f"\n[bold green]{day}[/bold green]")
                console.print("  [dim]No tasks scheduled[/dim]")

        # Get AI advice if API key is available
        if config["google_api_key"]:
            try:
                with console.status("[bold green]Digby is preparing weekly advice..."):
                    agent = DigbyAgent(
                        api_key=config["google_api_key"],
                        goals_file=config["goals_file"],
                    )
                    advice = agent.generate_weekly_advice(schedule)

                console.print(
                    Panel(
                        advice,
                        title="[bold blue]Digby's Weekly Advice[/bold blue]",
                        style="blue",
                    )
                )

            except Exception as e:
                console.print(f"[dim]Note: Could not generate AI advice ({e})[/dim]")

    except Exception as e:
        console.print(f"[red]Error generating schedule: {e}[/red]")


@cli.command()
def progress():
    """Show progress on all goals"""

    config = get_config()
    planner = TaskPlanner(config["goals_file"])
    goals = planner.get_active_goals()

    if not goals:
        console.print("[yellow]No active goals found.[/yellow]")
        return

    console.print(Panel.fit("[bold blue]Goal Progress[/bold blue]", style="blue"))

    with Progress(
        TextColumn("[bold blue]{task.fields[goal_name]}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TextColumn("({task.completed}/{task.total} tasks)"),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        for goal in goals:
            stats = planner.get_goal_progress(goal.id)

            task = progress.add_task(
                "progress",
                goal_name=goal.title[:30],
                total=stats["total_tasks"],
                completed=stats["completed_tasks"],
            )

            progress.update(task, completed=stats["completed_tasks"])

    # Overall summary
    summary = planner.get_weekly_summary()
    console.print(f"\n[bold]Overall Summary:[/bold]")
    console.print(f"  • Active Goals: {summary['active_goals']}")
    console.print(f"  • Pending Tasks: {summary['total_pending_tasks']}")
    console.print(f"  • Estimated Hours: {summary['total_estimated_hours']}")


@cli.command()
@click.argument("task_id")
@click.argument(
    "status", type=click.Choice(["pending", "in_progress", "completed", "cancelled"])
)
def update_task(task_id: str, status: str):
    """Update task status"""

    config = get_config()
    planner = TaskPlanner(config["goals_file"])

    if planner.update_task_status(task_id, status):
        console.print(f"[green]✓[/green] Updated task {task_id} to {status}")
    else:
        console.print(f"[red]✗[/red] Task {task_id} not found")


@cli.command()
@click.argument("message", nargs=-1)
def chat(message):
    """Chat with Digby AI assistant"""

    config = get_config()

    if not config["google_api_key"]:
        console.print(
            "[red]Error: Google API key not found. Please set GOOGLE_API_KEY environment variable.[/red]"
        )
        return

    user_message = " ".join(message)

    if not user_message:
        console.print("[yellow]Please provide a message to chat with Digby.[/yellow]")
        return

    try:
        with console.status("[bold green]Digby is thinking..."):
            agent = DigbyAgent(
                api_key=config["google_api_key"], goals_file=config["goals_file"]
            )
            response = agent.chat(user_message)

        console.print(
            Panel(response, title="[bold blue]Digby[/bold blue]", style="blue")
        )

    except Exception as e:
        console.print(f"[red]Error chatting with Digby: {e}[/red]")


@cli.command()
def setup():
    """Setup Digby with initial configuration"""

    console.print(
        Panel.fit("[bold blue]Digby Virtual Assistant Setup[/bold blue]", style="blue")
    )

    # Check for API key
    api_key = click.prompt("Enter your Google API Key", hide_input=True)

    # Create .env file
    env_content = f"""# Digby Virtual Assistant Configuration
GOOGLE_API_KEY={api_key}
GOALS_FILE=goals.json
LOG_LEVEL=INFO
MODEL_NAME=gemini-pro
HOURS_PER_DAY=6
WORK_DAYS=Monday,Tuesday,Wednesday,Thursday,Friday
"""

    with open(".env", "w") as f:
        f.write(env_content)

    console.print("[green]✓[/green] Configuration saved to .env file")
    console.print("\n[bold]Next steps:[/bold]")
    console.print("1. Run [cyan]digby add-goal 'Your first goal'[/cyan] to add a goal")
    console.print("2. Run [cyan]digby weekly-schedule[/cyan] to see your schedule")
    console.print(
        "3. Run [cyan]digby chat 'Hello Digby'[/cyan] to chat with your assistant"
    )


if __name__ == "__main__":
    cli()
