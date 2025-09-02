"use server";
import axios from "axios";

// Configuration for the health check
const HEALTH_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const HEALTH_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_URL1 + "/health"; // Replace with your actual health endpoint

// Function to perform the health check
async function performHealthCheck() {
  try {
    const response = await axios.get(HEALTH_ENDPOINT);
    console.log(
      `Health check at ${new Date().toISOString()}: Status ${
        response.status
      }, Data: ${JSON.stringify(response.data)}`
    );
  } catch (error) {
    console.error(`Health check failed at ${new Date().toISOString()}:`, error);
  }
}

// Background task to run health checks
let isHealthCheckRunning = false;

function startHealthCheckInterval() {
  if (!isHealthCheckRunning) {
    isHealthCheckRunning = true;
    performHealthCheck(); // Run immediately on start
    setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);
    console.log("Health check interval started");
  }
}

// Start the health check when the server starts
startHealthCheckInterval();
