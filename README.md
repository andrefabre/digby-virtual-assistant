# Digby Virtual Assistant 🤖

A Goal-Oriented Planning Agent that acts as your personalized AI assistant for hierarchical task planning and productivity management. Digby uses Google's Gemini AI to break down your goals into actionable tasks and creates balanced weekly schedules to keep you on track.

## 🌟 Features

- **AI-Powered Goal Decomposition**: Uses Google Gemini to intelligently break down high-level goals into milestones and actionable tasks
- **Hierarchical Planning**: Organizes work in a Goal → Year → Month → Week → Day structure
- **Smart Scheduling**: Automatically generates balanced weekly schedules based on your priorities and available time
- **Progress Tracking**: Monitor your progress with detailed statistics and visual progress bars
- **Natural Language Chat**: Communicate with Digby using natural language for planning assistance
- **Priority Management**: Intelligent task prioritization (urgent, high, medium, low)
- **Flexible Configuration**: Customizable work hours, days, and scheduling preferences

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/andrefabre/digby-virtual-assistant.git
cd digby-virtual-assistant
pip install -r requirements.txt
pip install -e .
```

### 2. Setup

Get your free Google API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and run:

```bash
digby setup
```

This will create a `.env` file with your configuration.

### 3. Add Your First Goal

```bash
digby add-goal "Learn Python Machine Learning" --deadline 2024-12-31 --priority high
```

### 4. Generate Your Weekly Schedule

```bash
digby weekly-schedule
```

### 5. Track Your Progress

```bash
digby progress
```

## 📋 Commands

### Goal Management
- `digby add-goal "Goal description" -d YYYY-MM-DD -p priority` - Add a new goal with AI decomposition
- `digby list-goals` - View all active goals
- `digby progress` - Show progress on all goals

### Schedule Management
- `digby weekly-schedule` - Generate and display your weekly schedule
- `digby update-task TASK_ID STATUS` - Update task status (pending/in_progress/completed/cancelled)

### AI Assistant
- `digby chat "How should I prioritize my tasks?"` - Chat with Digby for planning advice
- `digby setup` - Initial setup wizard

## 🏗️ Architecture

### Core Components

#### 1. Task Planner (`digby/core/plan_tasks.py`)
The heart of Digby's planning system:
- **Goal Management**: CRUD operations for goals, milestones, and tasks
- **Schedule Generation**: Intelligent weekly schedule creation with workload balancing
- **Progress Tracking**: Statistics and progress calculation
- **Data Persistence**: JSON-based storage with validation

#### 2. AI Agent (`digby/agents/digby_agent.py`)
AI-powered intelligence layer:
- **Goal Decomposition**: Uses Gemini to break goals into actionable components
- **Weekly Advice**: Generates personalized productivity advice
- **Natural Language Processing**: Handles conversational interactions
- **Motivational Support**: Provides encouraging progress updates

#### 3. CLI Interface (`digby/cli.py`)
User-friendly command-line interface:
- **Rich Terminal UI**: Beautiful tables, progress bars, and panels
- **Interactive Commands**: Intuitive goal and task management
- **Real-time Feedback**: Status updates and error handling

### Data Structure

```json
{
  "goals": [
    {
      "id": "goal_id",
      "title": "Goal Title",
      "description": "Detailed description",
      "priority": "high",
      "deadline": "2024-12-31",
      "status": "active",
      "milestones": [
        {
          "id": "milestone_id", 
          "title": "Milestone Title",
          "description": "Milestone description",
          "deadline": "2024-06-30",
          "status": "pending",
          "tasks": [
            {
              "id": "task_id",
              "title": "Task Title", 
              "description": "Task description",
              "estimated_hours": 8,
              "priority": "high",
              "status": "pending",
              "tags": ["tag1", "tag2"]
            }
          ]
        }
      ]
    }
  ]
}
```

## ⚙️ Configuration

Create a `.env` file (or use `digby setup`):

```bash
# Required: Google API Key
GOOGLE_API_KEY=your_api_key_here

# Optional: Customize behavior
GOALS_FILE=goals.json
LOG_LEVEL=INFO
MODEL_NAME=gemini-pro
HOURS_PER_DAY=6
WORK_DAYS=Monday,Tuesday,Wednesday,Thursday,Friday
```

## 🧪 Testing

Run the test suite:

```bash
# Install test dependencies
pip install -r requirements.txt

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=digby --cov-report=html
```

## 🔧 Development

### Setting up Development Environment

```bash
# Clone the repository
git clone https://github.com/andrefabre/digby-virtual-assistant.git
cd digby-virtual-assistant

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e .
pip install -r requirements.txt
```

### Code Quality

The project uses several tools for code quality:

```bash
# Linting
flake8 digby/

# Type checking  
mypy digby/ --ignore-missing-imports

# Code formatting
black digby/

# Run all checks
make lint  # If you have a Makefile
```

## 🚀 GitHub Actions

The repository includes a comprehensive CI/CD pipeline that runs on all PRs:

- **Multi-Python Testing**: Tests on Python 3.9, 3.10, and 3.11
- **Code Quality Checks**: Linting with flake8, type checking with mypy
- **Code Formatting**: Ensures consistent formatting with black
- **Test Coverage**: Runs pytest with coverage reporting
- **Automated Status Checks**: All checks must pass before merging

## 📈 Usage Examples

### Example 1: Learning a New Skill

```bash
# Add a learning goal
digby add-goal "Master React Development" --deadline 2024-08-31 --priority high

# Check your schedule
digby weekly-schedule

# Update task progress
digby update-task react_task_1 completed

# Get AI advice
digby chat "I'm struggling with React hooks. Any advice?"
```

### Example 2: Project Management

```bash
# Add a project goal
digby add-goal "Build a Personal Website" --deadline 2024-06-30 --priority medium

# View all goals
digby list-goals

# Track progress
digby progress

# Chat with Digby
digby chat "How should I balance my website project with my React learning?"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pytest tests/`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini for providing powerful AI capabilities
- LangChain for AI orchestration framework
- Rich library for beautiful terminal interfaces
- The Python community for excellent tooling

## 🗺️ Roadmap

- [ ] Web interface for goal management
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Team collaboration features
- [ ] Mobile app companion
- [ ] Advanced analytics and reporting
- [ ] Integration with productivity tools (Notion, Trello)
- [ ] Voice interaction capabilities
- [ ] Custom AI model fine-tuning

---

**Digby** - Your personal AI-powered productivity companion 🚀
