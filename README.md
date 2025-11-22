# KU-Hangout


## Sprint Demo Recordings

- **Sprint 1** – [Update Presentation](https://youtu.be/odKzeVAQSOY)  
- **Sprint 2** – [Update Presentation](https://youtu.be/epAQCJXvEkY?si=LP4NqYRhdWvhpoTg)  
- **Sprint 3** – [Update Presentation](https://youtu.be/Z7x8ZrrPZ20)  
- **Sprint 4** – [Update Presentation](https://youtu.be/4V1cTgCTOw8)  
- **Sprint 5** – [Update Presentation](https://youtu.be/L_bgXiK3jnY)  

## Project Documentation

- **Weekly Update Document** – [KU-Hangout Weekly Updates](https://docs.google.com/document/d/14TmDs2kUxD4I94jZ80KuBz-bRxxUIAyFYms6w-thFw8/edit?tab=t.0#heading=h.n8u6bldlj0e)

## Overview

KU-Hangout is a full-stack social platform designed to help users create, discover, and join hangout activities and events. The application enables users to organize plans with location-based features, communicate through real-time chat, receive notifications, and review event leaders. Built with a modern tech stack, KU-Hangout provides a seamless experience for coordinating social gatherings and building communities.

This is a full-stack application consisting of a React-based frontend and a Django-powered backend with real-time WebSocket support for chat and notifications.

## Key Features

### Plan Management
- **Create Plans**: Users can create event plans with title, description, location (with Google Maps integration), event time, maximum participants, and multiple images
- **Join/Leave Plans**: Participate in plans created by others with automatic participant tracking
- **Save Plans**: Bookmark interesting plans for later reference
- **Pin Plans**: Pin favorite plans to user profiles for easy access
- **Plan History**: View all past plans a user has participated in
- **Tag System**: Categorize plans with tags for better discoverability
- **Location-Based**: Integration with Google Maps API for location selection and display

### Real-Time Communication
- **WebSocket Chat**: Real-time messaging system with chat threads for each plan
- **Message Read Receipts**: Track which users have read messages
- **Chat Notifications**: Get notified of new messages instantly

### Notification System
- **Plan Notifications**: Alerts for join requests, plan updates, cancellations, and reminders
- **Chat Notifications**: Notifications for new messages and mentions
- **Real-time Delivery**: WebSocket-based notification delivery with read/unread status tracking

### User Management
- **User Profiles**: Customizable profiles with display name, bio, website, social links, and profile pictures
- **Role System**: Support for different user roles (User, Leader, Participant, Admin)
- **Authentication**: JWT-based authentication with access and refresh tokens

### Review System
- **Rate Leaders**: Users can review and rate plan leaders after events
- **Average Ratings**: Automatic calculation of leader average ratings and review counts
- **Plan-Specific Reviews**: Reviews tied to specific plans for context

### Media Management
- **Cloudinary Integration**: Cloud-based image storage for plan images and user profiles
- **Multiple Images**: Support for multiple images per plan
- **Local Fallback**: Optional local file storage when Cloudinary is not configured

## Tech Stack

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.17 with custom theming
- **UI Components**: shadcn/ui with Radix UI primitives
- **Routing**: React Router DOM 7.9.5
- **Forms**: React Hook Form 7.66.0 with Zod 4.1.12 validation
- **Maps**: @react-google-maps/api 2.20.7 for Google Maps integration
- **Animation**: Framer Motion 12.23.24
- **Date Handling**: date-fns 4.1.0
- **HTTP Client**: Fetch API with custom service layer
- **State Management**: React Context API (AuthContext, NotificationContext, ChatContext)

### Backend
- **Framework**: Django 5.2.5
- **API**: Django REST Framework 3.16.1
- **Real-Time**: Django Channels 4.3.1 with Daphne ASGI server
- **Authentication**: djangorestframework-simplejwt 5.5.1 with JWT tokens
- **Database ORM**: Django ORM with PostgreSQL backend
- **WebSocket**: Channels with Redis channel layer
- **Image Storage**: Cloudinary 1.44.1 via django-cloudinary-storage 0.3.0
- **API Documentation**: drf-spectacular 0.27.2
- **CORS**: django-cors-headers 4.8.0

### Database & Infrastructure
- **Primary Database**: PostgreSQL 16
- **Message Broker**: Redis 7 (for Channels layer)
- **Database Admin**: pgAdmin 4.8 (for development)
- **Containerization**: Docker with Docker Compose
- **Python Version**: 3.12

### Third-Party Services
- **Cloudinary**: Image hosting and transformation
- **Google Maps API**: Location search and map display

## Project Structure

```
KU-Hangout/
├── backend/                      # Django backend application
│   ├── accounts/                 # User authentication and registration
│   ├── backend/                  # Django project settings and configuration
│   │   ├── settings.py          # Main settings file
│   │   ├── urls.py              # Root URL configuration
│   │   ├── routing.py           # WebSocket routing
│   │   └── asgi.py              # ASGI application entry point
│   ├── chat/                    # Real-time chat system
│   │   ├── models.py            # Chat threads, members, messages, read receipts
│   │   ├── consumers.py         # WebSocket consumers for chat
│   │   ├── database.py          # Database operations for chat
│   │   └── handlers.py          # Message handling logic
│   ├── notifications/           # Notification system
│   │   ├── models.py            # Notification model
│   │   ├── consumers.py         # WebSocket consumers for notifications
│   │   ├── signals.py           # Signal handlers for auto-notifications
│   │   └── views/               # API views for notifications
│   ├── plans/                   # Plan management
│   │   ├── models.py            # Plans, PlanImage, SavedPlan, PinnedPlan models
│   │   ├── serializers/         # DRF serializers
│   │   ├── views/               # Plan CRUD and related operations
│   │   └── urls/                # Plan-related URL patterns
│   ├── participants/            # Plan participation tracking
│   ├── reviews/                 # Review and rating system
│   ├── tags/                    # Tag management
│   ├── users/                   # User profile management
│   ├── manage.py                # Django management script
│   └── requirements.txt         # Python dependencies
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.tsx  # Authentication state
│   │   │   ├── ChatContext.tsx  # Chat state and WebSocket
│   │   │   └── NotificationContext.tsx  # Notification state and WebSocket
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility functions
│   │   ├── pages/               # Page components
│   │   │   ├── home-page.tsx    # Main feed and plan discovery
│   │   │   ├── login-page.tsx   # Authentication
│   │   │   ├── message-page.tsx # Chat interface
│   │   │   └── user-profile-page.tsx  # User profiles
│   │   ├── services/            # API service layer
│   │   ├── App.tsx              # Main application component
│   │   └── main.tsx             # Application entry point
│   ├── package.json             # Node.js dependencies
│   └── vite.config.ts           # Vite configuration
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Docker image definition
├── CLOUDINARY_SETUP.md          # Cloudinary integration guide
└── README.md                    # This file
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Python**: Version 3.10 or higher (3.12 recommended)
- **pip**: Python package installer
- **PostgreSQL**: Version 14 or higher (16 recommended)
- **Redis**: Version 6 or higher (7 recommended)
- **Docker & Docker Compose**: Optional but recommended for easier setup

### Installation

#### Option 1: Docker Setup (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd KU-Hangout
```

2. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your configuration (see Environment Variables section below)

4. Start all services with Docker Compose:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- pgAdmin on port 8080
- Redis on port 6379
- Django backend on port 8000

5. The backend will automatically run migrations and start the server

#### Option 2: Manual Setup

##### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root with required variables (see Environment Variables section)

5. Run database migrations:
```bash
python manage.py migrate
```

6. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

7. Start the Django development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

##### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
# Either format works:
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# OR
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Building for Production

#### Frontend

```bash
cd frontend
npm run build
```

The production build will be created in the `frontend/dist` directory.

#### Backend

For production deployment with Docker:

```bash
docker-compose up -d
```

The backend automatically runs with Daphne ASGI server, which supports both HTTP and WebSocket connections.

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
POSTGRES_DB=ku_hangout_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost  # Use 'postgres' when running with Docker Compose
POSTGRES_PORT=5432

# Redis Configuration (for Channels)
REDIS_HOST=127.0.0.1  # Use 'redis' when running with Docker Compose
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional
REDIS_USE_SSL=false

# Cloudinary Configuration (Optional - for image storage)
USE_CLOUDINARY=True  # Set to False to use local file storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# pgAdmin (Optional - for database management)
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
```

**Note**: When `USE_CLOUDINARY=False`, images will be stored in the local `backend/media` directory. For production deployments, Cloudinary is highly recommended.

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Google Maps API Key (for location features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Alternative format (both are supported):
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Important**: You must restart the development server after adding or modifying environment variables.

### Obtaining API Keys

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** and **Maps JavaScript API**
4. Create credentials (API Key)
5. Configure API key restrictions (HTTP referrer for production)

See `frontend/GOOGLE_MAPS_SETUP.md` for detailed setup instructions.

#### Cloudinary
1. Sign up for a free account at [Cloudinary](https://cloudinary.com/users/register/free)
2. Navigate to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

See `CLOUDINARY_SETUP.md` for detailed setup and testing instructions.

## Usage

### Accessing the Application

1. **Start the Backend**: Ensure the Django server is running on `http://localhost:8000`
2. **Start the Frontend**: Ensure the Vite dev server is running on `http://localhost:5173`
3. **Open Browser**: Navigate to `http://localhost:5173`

### User Flow

#### 1. Authentication
- **Register**: Create a new account with username, email, and password
- **Login**: Authenticate using your credentials
- JWT tokens are automatically managed by the frontend

#### 2. Discovering Plans
- **Home Feed**: Browse all available plans on the home page
- **Filter Plans**: Use tags and search to find specific types of activities
- **View Details**: Click on a plan card to see full details, location, participants, and images

#### 3. Creating Plans
- **Create Button**: Click the "Create Plan" button on the home page
- **Fill Details**: 
  - Add title and description
  - Select location using Google Maps autocomplete
  - Set event date and time
  - Define maximum participants
  - Add tags for categorization
  - Upload images (up to multiple images)
- **Submit**: Create the plan and it will appear in the feed

#### 4. Managing Plans
- **Join Plan**: Click the join button on any plan you're interested in
- **Leave Plan**: Exit a plan you've joined
- **Save Plan**: Bookmark plans for later by clicking the save icon
- **Pin Plan**: Pin important plans to your profile
- **Edit Plan**: Plan leaders can edit their own plans
- **Delete Plan**: Plan leaders can delete their own plans

#### 5. Communication
- **Chat Access**: Automatic chat threads are created for plans you've joined
- **Messages Page**: Navigate to `/messages` to view all your chat threads
- **Real-time Chat**: Send and receive messages instantly via WebSocket
- **Read Receipts**: See who has read your messages

#### 6. Notifications
- **Bell Icon**: Click the notification bell to view all notifications
- **Real-time Updates**: Receive instant notifications for:
  - Plan join requests and updates
  - New messages in your chat threads
  - Plan cancellations or changes
  - Mentions in chat
- **Mark as Read**: Click on notifications to mark them as read

#### 7. User Profiles
- **View Profile**: Click on any username to view their profile
- **Edit Profile**: Update your display name, bio, profile picture, website, and social links
- **View History**: See all plans a user has created or participated in
- **Pinned Plans**: Featured plans appear at the top of profiles
- **Reviews**: View ratings and reviews for plan leaders

#### 8. Reviews
- **Rate Leaders**: After participating in a plan, review the leader
- **Provide Feedback**: Leave comments with your rating
- **View Ratings**: Check average ratings on user profiles

### Admin Access

To access the Django admin panel:

1. Create a superuser (if not already done):
```bash
cd backend
python manage.py createsuperuser
```

2. Navigate to `http://localhost:8000/admin`
3. Login with your superuser credentials
4. Manage users, plans, notifications, and other data through the admin interface

## API Documentation

### Authentication Endpoints

```
POST /api/register/                    # User registration
POST /api/login/                       # User login
POST /api/logout/                      # User logout
POST /api/token/                       # Obtain JWT token
POST /api/token/refresh/               # Refresh JWT token
```

### User Endpoints

```
GET    /users/profile/                 # Get current user profile
PUT    /users/profile/                 # Update current user profile
GET    /users/profile/<username>/      # Get specific user profile
```

### Plan Endpoints

```
GET    /plans/                         # List all plans
POST   /plans/create/                  # Create a new plan
GET    /plans/<id>/                    # Get plan details
PUT    /plans/<id>/update/             # Update a plan
DELETE /plans/<id>/delete/             # Delete a plan

POST   /plans/<id>/join/               # Join a plan
POST   /plans/<id>/leave/              # Leave a plan
GET    /plans/<id>/summary/            # Get plan membership summary

POST   /plans/<id>/save/               # Save/bookmark a plan
DELETE /plans/<id>/unsave/             # Remove bookmark
GET    /plans/saved/                   # List saved plans

POST   /plans/<id>/pin/                # Pin a plan to profile
DELETE /plans/<id>/unpin/              # Unpin a plan
GET    /plans/pinned/                  # List pinned plans

GET    /plans/history/                 # Get plan participation history
GET    /homepage/                      # Get homepage feed
```

### Chat Endpoints (REST)

```
GET    /chat/threads/                  # List user's chat threads
GET    /chat/threads/<id>/messages/    # Get messages in a thread
```

### Chat WebSocket

```
WS     /ws/chat/<thread_id>/           # WebSocket connection for real-time chat
```

Messages sent and received via WebSocket include:
- `type`: Message type (e.g., 'chat_message', 'mark_read')
- `body`: Message content
- `sender`: Sender information
- `timestamp`: Message timestamp

### Notification Endpoints (REST)

```
GET    /notifications/                 # List all notifications
GET    /notifications/unread/          # List unread notifications
POST   /notifications/<id>/mark-read/  # Mark notification as read
POST   /notifications/mark-all-read/   # Mark all as read
DELETE /notifications/<id>/delete/     # Delete notification
```

### Notification WebSocket

```
WS     /ws/notifications/              # WebSocket connection for real-time notifications
```

### Review Endpoints

```
POST   /reviews/create/                # Create a review for a leader
GET    /reviews/user/<user_id>/        # Get reviews for a user
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

The frontend automatically handles token management and refresh.

## Testing

### Backend Tests

The backend includes test files for various components:

```bash
cd backend

# Run all tests
python manage.py test

# Run tests for specific apps
python manage.py test plans
python manage.py test chat
python manage.py test notifications
python manage.py test reviews
python manage.py test users

# Run with verbose output
python manage.py test --verbosity=2
```

Test files are located in:
- `backend/plans/test/` - Plan functionality tests
- `backend/chat/tests/` - Chat and messaging tests
- `backend/notifications/test/` - Notification system tests
- `backend/reviews/test/` - Review system tests
- `backend/users/test/` - User profile tests

### Frontend Tests

The frontend uses ESLint for code quality:

```bash
cd frontend

# Run linter
npm run lint
```

## Deployment

### Docker Deployment

The application is configured for Docker deployment with the included `docker-compose.yml`:

1. **Configure Environment**: Ensure your `.env` file has production settings:
   - Set `DJANGO_DEBUG=False`
   - Use strong `DJANGO_SECRET_KEY`
   - Configure `DJANGO_ALLOWED_HOSTS` for your domain
   - Set `USE_CLOUDINARY=True` for production image storage

2. **Build and Start**:
```bash
docker-compose up -d --build
```

3. **Run Migrations** (first time):
```bash
docker-compose exec backend python manage.py migrate
```

4. **Create Superuser** (first time):
```bash
docker-compose exec backend python manage.py createsuperuser
```

5. **Collect Static Files**:
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### Services in Docker Compose

- **PostgreSQL**: Database server on port 5432
- **pgAdmin**: Database admin UI on port 8080
- **Redis**: Message broker for Channels on port 6379
- **Backend**: Django/Daphne ASGI server on port 8000

### Production Considerations

1. **Frontend Deployment**:
   - Build the frontend: `npm run build`
   - Serve the `dist` directory with a web server (Nginx, Apache, CDN)
   - Configure API endpoint URLs appropriately

2. **Backend Deployment**:
   - Use environment variables for all secrets
   - Enable HTTPS/WSS for secure WebSocket connections
   - Configure CORS for your frontend domain
   - Set up database backups
   - Use a process manager (systemd, supervisord) or container orchestration

3. **Database**:
   - Use managed PostgreSQL for reliability (AWS RDS, Google Cloud SQL, etc.)
   - Configure regular backups
   - Enable connection pooling for better performance

4. **Redis**:
   - Use managed Redis for production (AWS ElastiCache, Redis Cloud, etc.)
   - Configure persistence if needed
   - Set up Redis authentication

5. **Static Files & Media**:
   - Use Cloudinary or S3 for media files
   - Use a CDN for static assets
   - Configure proper CORS headers

6. **Monitoring**:
   - Set up logging (Django logging, Sentry for error tracking)
   - Monitor WebSocket connections
   - Track database performance
   - Monitor Redis memory usage

## Known Limitations & Future Improvements

### Current Limitations

1. **Google Maps Autocomplete**: The frontend uses the deprecated `Autocomplete` component from `@react-google-maps/api`. While still functional, Google recommends migrating to `PlaceAutocompleteElement` in future updates.

2. **Ad Blocker Compatibility**: Some browser ad blockers may interfere with Google Maps API requests, requiring users to whitelist the site.

3. **Review System**: Currently, users can only review plan leaders, not general participants. One review per reviewer-leader pair is allowed.

4. **File Upload Size**: The application does not explicitly limit image upload sizes on the frontend. Consider implementing client-side validation for better user experience.

5. **Security**: The default Django `SECRET_KEY` in `settings.py` should be changed for production deployments.

### Planned Improvements

Based on the codebase structure, potential future enhancements could include:

1. **Enhanced Search**: Full-text search for plans with Elasticsearch or similar technology

2. **Mobile Application**: React Native or Progressive Web App (PWA) implementation

3. **Advanced Notifications**: Push notifications for mobile devices, email notifications

4. **Calendar Integration**: Export plans to Google Calendar, iCal, etc.

5. **Plan Templates**: Reusable templates for common event types

6. **Social Features**: Friend system, plan sharing on social media

7. **Analytics Dashboard**: For plan leaders to track engagement and participation

8. **Moderation Tools**: Admin tools for content moderation and user management

9. **Multi-language Support**: i18n implementation for international users

10. **Payment Integration**: Optional payment system for paid events

## Contributing

While this project is part of a university course (KU ISP), contributions and suggestions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Project Background

This project was developed as part of the Individual Software Process (ISP) course at Kasetsart University. The project followed an agile development methodology with multiple sprint cycles. Development progress was documented through weekly updates and presentations.

## License

No explicit license has been provided for this project. Please contact the project maintainers for information regarding usage and distribution rights.

## Acknowledgments

- Built with Django and React
- UI components from shadcn/ui
- Icons from Lucide React
- Real-time functionality powered by Django Channels
- Image hosting by Cloudinary
- Maps by Google Maps Platform
