# OutfitAI - Smart Fashion Assistant

OutfitAI is a comprehensive fashion application that helps users manage their wardrobe, get outfit recommendations, and share their style with others. The application uses AI to provide personalized fashion advice and outfit suggestions.

## Features

- **Profile Management**: Customize your profile and preferences
- **Wardrobe Management**: Upload and organize your clothes
- **AI-Powered Recommendations**: Get personalized outfit suggestions based on:
  - Weather conditions
  - Event type
  - Personal style preferences
  - Occasion
  - Season
- **Weekly Planning**: Plan your outfits for the week
- **Social Sharing**: Share your outfits with friends
- **Cloth Identification**: AI-powered cloth recognition
- **Image Generation**: Generate outfit combinations
- **Shopping Integration**: Get outfit suggestions from popular e-commerce platforms Amazon,Myntra and Flipkart
- **Smart Outfit Matching**: AI-powered outfit combinations based on your existing wardrobe

## Tech Stack

### Frontend
- React Native
- React Navigation
- Expo

### Backend
- Node.js
- Express.js
- MongoDB
- Cloudinary (for image storage)

### AI Technologies
- Generative AI (GenAI) for outfit suggestions and recommendations
- Nebius for AI-powered image generation

## Project Structure

```
outfitAI-app/
├── frontend/           # React Native application
│   ├── Components/     # React components
│   ├── assets/        # Static assets
│   └── App.js         # Main application file
│
└── backend/           # Node.js server
    ├── api/          # API controllers
    ├── routes/       # Route definitions
    ├── model/        # Database models
    ├── db/          # Database configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Expo CLI
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd outfitAI-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
   - Create a `.env` file in the backend directory
   

5. Start the backend server:
```bash
cd backend
npm start
```

6. Start the frontend application:
```bash
cd frontend
expo start
```



## Contributing

We welcome contributions from the community! Whether you're interested in improving features, fixing bugs, or adding new functionality, your input is valuable. Feel free to reach out to us with your ideas and suggestions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

