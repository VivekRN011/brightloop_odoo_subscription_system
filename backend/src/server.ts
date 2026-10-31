import "dotenv/config";
import app from "./app";
import { BillingSchedulerService } from "./services/billing-scheduler.service";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`
====================================
BRIGHTLOOP API SERVER
====================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || "development"}
Status: Running
====================================
`);

  // Start standing automated billing cron scheduler
  try {
    BillingSchedulerService.startScheduler();
  } catch (err) {
    console.error("Failed to start automated billing scheduler:", err);
  }
});
