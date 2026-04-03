import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotificationContext = createContext({
  notify: () => {}
});

export function NotificationProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback((message, options = {}) => {
    const text = typeof message === "string" ? message : "Action completed.";
    const severity = options.severity || "info";
    const duration = options.duration ?? 3500;

    setQueue((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        message: text,
        severity,
        duration
      }
    ]);
  }, []);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setOpen(true);
    }
  }, [current, queue]);

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message) => {
      notify(String(message ?? "Action completed."), { severity: "info" });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [notify]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
      const requestMethod = (
        init?.method ||
        (input instanceof Request ? input.method : "GET")
      ).toUpperCase();
      const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(requestMethod);

      try {
        const response = await originalFetch(input, init);

        if (isMutation) {
          if (response.ok) {
            notify("Action completed successfully.", { severity: "success" });
          } else {
            notify("Action failed. Please try again.", { severity: "error" });
          }
        }

        return response;
      } catch (error) {
        if (isMutation) {
          notify("Network error while processing your action.", { severity: "error" });
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [notify]);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleExited = () => {
    setQueue((prev) => prev.slice(1));
    setCurrent(null);
  };

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={current?.duration || 3500}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={current?.severity || "info"}
          variant="filled"
          sx={{ width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {current?.message || "Action completed."}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
