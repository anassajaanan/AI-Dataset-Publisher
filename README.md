This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## MongoDB Setup

This application uses MongoDB for data storage. Follow these steps to set up your MongoDB connection:

### 1. Update your MongoDB Connection String

1. Open the `.env.local` file in the root of your project
2. Update the `MONGODB_URI` with your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.w4xkbyu.mongodb.net/dataset-platform?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `<username>` and `<password>` with your actual MongoDB credentials
- Change `dataset-platform` to your preferred database name
- MongoDB will automatically create the database when you first insert data
- Keep the `?retryWrites=true&w=majority` parameters as they ensure data consistency

### 2. Test Your Connection

We've provided a script to test your MongoDB connection:

```bash
node scripts/test-mongodb-connection.js
```

This script will verify that your connection string is correct and list any existing collections.

### 3. Run the Setup Script (Optional)

We've provided a setup script that will create the necessary collections in your MongoDB database:

```bash
node scripts/setup-mongodb.js
```

This script will:
- Connect to your MongoDB instance
- Create the database if it doesn't exist
- Create the required collections

### 4. Database Structure

The application automatically creates the following collections:

- `datasets`: Stores basic information about uploaded datasets
- `datasetversions`: Stores version information for datasets
- `datasetmetadata`: Stores metadata for datasets

### 5. Troubleshooting

If you encounter connection issues:
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check that your username and password are correct
- Verify that the connection string format is correct
