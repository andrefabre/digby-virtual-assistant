"""
Digby Virtual Assistant - A Goal-Oriented Planning Agent

A personal virtual assistant that helps with hierarchical task planning
using AI-powered goal decomposition and weekly schedule generation.
"""

__version__ = "0.1.0"
__author__ = "Andre Fabre"

from .core.plan_tasks import TaskPlanner
from .agents.digby_agent import DigbyAgent

__all__ = ["TaskPlanner", "DigbyAgent"]
