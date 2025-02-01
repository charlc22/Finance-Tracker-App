<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# Finance-Tracker-App
Senior Capstone Project - Full-Stack Finance and Budgeting Web Application
>>>>>>> 22bf98b339d3ef1796241f4318c5dbc49452e5aa

# Finance Tracker App - Team Setup Guide

## Prerequisites
1. Install [Node.js](https://nodejs.org/) (v16 or higher)
2. Install [Git](https://git-scm.com/)
3. Install [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) (Community Edition is fine)
4. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for database)

## Project Structure
```
finance-tracker-app/
├── client/             # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   └── common/
│   │   └── context/
│   └── package.json
│
├── server/             # Express backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
│
└── docker-compose.yml
```

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/charlc22/Finance-Tracker-App.git
cd Finance-Tracker-App
```

### 2. Frontend Setup (React)
```bash
cd client
npm install
```

### 3. Backend Setup (Express)
```bash
cd server
npm install
```

### 4. Database Setup (MongoDB)
- Note: Only the team lead needs to run the MongoDB container
- Team members will connect to the team lead's MongoDB instance

For team lead:
```bash
# In project root
docker-compose up -d
```

For team members:
- Get the MongoDB connection string from team lead
- Update your `.env` file with the provided connection string

## Environment Setup

### Frontend (.env in client folder)
```env
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env in server folder)
```env
PORT=5000
MONGODB_URI=mongodb://admin:password@[TEAM_LEAD_IP]:27017/finance_tracker?authSource=admin
JWT_SECRET=your_jwt_secret_key
```

## Running the Application

### Start Frontend
```bash
cd client
npm start
```
Frontend will run on http://localhost:3000

### Start Backend
```bash
cd server
npm run dev
```
Backend will run on http://localhost:5000

### Access MongoDB Admin Interface
- MongoDB Express interface: http://[TEAM_LEAD_IP]:8081
- Credentials will be provided by team lead

## Development Workflow

### Git Workflow
1. Always pull latest changes:
```bash
git pull origin main
```

2. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and commit:
```bash
git add .
git commit -m "Descriptive message"
```

4. Push your branch:
```bash
git push origin feature/your-feature-name
```

5. Create a Pull Request on GitHub

### Code Organization
- Components go in appropriate folders under `client/src/components/`
- React context files go in `client/src/context/`
- Backend routes go in `server/src/routes/`
- Database models go in `server/src/models/`

## Available Scripts

### Frontend
```bash
npm start    # Start development server
npm test     # Run tests
npm run build # Build for production
```

### Backend
```bash
npm run dev  # Start development server
npm start    # Start production server
```

## Troubleshooting

### Common Issues

1. "Module not found" errors:
    - Delete node_modules folder
    - Run `npm install` again

2. MongoDB connection issues:
    - Check if team lead's MongoDB container is running
    - Verify your IP address and port settings
    - Check firewall settings

3. Git issues:
    - Always pull before creating a new branch
    - Resolve conflicts locally before pushing

### Getting Help
1. Check this documentation first
2. Ask in the team chat
3. Contact team lead for database-related issues
4. Create a detailed issue in the GitHub repository

## Next Steps
1. Review the API documentation in the `server/docs` folder
2. Check the component documentation in the `client/docs` folder
3. Set up your development environment
4. Join the team chat for updates

## Security Notes
1. Never commit .env files
2. Keep the MongoDB credentials secure
3. Use strong passwords
4. Follow secure coding practices

## Feature Implementation Guidelines
1. Frontend Features
    - Create components in appropriate folders
    - Use the provided LoadingSpinner for loading states
    - Follow the established routing structure
    - Use context for state management

2. Backend Features
    - Create new routes in separate files
    - Use middleware for authentication
    - Follow the established error handling pattern
    - Document new endpoints

## Testing
- Write tests for new components
- Test your changes locally before pushing
- Ensure MongoDB connection works
- Test both success and error cases