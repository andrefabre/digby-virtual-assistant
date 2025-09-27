"""
Configuration utilities for Digby Virtual Assistant
"""

import os
import logging
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


def setup_logging(level: str = "INFO") -> None:
    """Setup logging configuration"""

    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format=log_format,
        handlers=[logging.StreamHandler(), logging.FileHandler("digby.log")],
    )


def load_environment() -> None:
    """Load environment variables from .env file"""

    env_file = Path(".env")
    if env_file.exists():
        load_dotenv(env_file)


def get_google_api_key() -> Optional[str]:
    """Get Google API key from environment"""

    return os.getenv("GOOGLE_API_KEY")


def get_config() -> dict:
    """Get application configuration"""

    load_environment()

    return {
        "google_api_key": get_google_api_key(),
        "goals_file": os.getenv("GOALS_FILE", "goals.json"),
        "log_level": os.getenv("LOG_LEVEL", "INFO"),
        "model_name": os.getenv("MODEL_NAME", "gemini-pro"),
        "hours_per_day": int(os.getenv("HOURS_PER_DAY", "6")),
        "work_days": os.getenv(
            "WORK_DAYS", "Monday,Tuesday,Wednesday,Thursday,Friday"
        ).split(","),
    }
