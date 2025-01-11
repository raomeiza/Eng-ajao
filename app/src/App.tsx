import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import socketIOClient from "socket.io-client";
import Login from "./components/login/login";
import {
  CircularProgress,
  ListItemIcon,
  SpeedDial,
  SpeedDialAction,
  Typography,
} from "@mui/material";
import LineClickNoSnap from "./components/chart";
import MTable from "./components/table";
import {
  AutoGraph,
  CheckBox,
  Code,
  Download,
  Error,
  ListAlt,
  TableChart,
} from "@mui/icons-material";
import { API_URL } from "./config";

export interface IOTDAta {
  batteryVoltage: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  isCharging: boolean;
  time: string;
}

export interface User {
  email: string;
  token: string;
  userId: string;
}

export default function FixedBottomNavigation() {
  const userRef = React.useRef<User | null>(null);
  const iotDataRef = React.useRef<IOTDAta[]>([]);
  const [iotData, setIotData] = React.useState<IOTDAta[]>([]);
  const [value, setValue] = React.useState(0);
  const [user, setUser] = React.useState<User | null>(userRef.current);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    if (downloading === "loading") return;
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [downloading, setDownloading] = React.useState<
    "loading" | "success" | "error" | null
  >(null);

  React.useEffect(() => {
    if (downloading !== "success" && downloading !== "error") return;
    const timer = setTimeout(() => {
      setDownloading(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [downloading]);

  const downloadFile = async (url: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        //@ts-ignore
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "iot_data-" + new Date().toLocaleString();

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      setDownloading("success");
    } catch (error) {
      setDownloading("error");
      console.error("There was an error downloading the file:", error);
    }
  };

  React.useEffect(() => {
    if (iotDataRef.current.length > 0 && iotData.length === 0) {
      setIotData(iotDataRef.current);
    }
  }, [iotData, setIotData]);

  React.useEffect(() => {
    if (!user) return;
    userRef.current = user;
    const socket = socketIOClient(API_URL, {
      transports: ["websocket"],
      query: {
        token: user.token,
      },
    });
    socket.on("connect", () => {
      socket.emit("authenticate", user.token);
    });
    socket.on("unauthorized", () => {
      setUser(null);
    });

    socket.on("authenticated", () => {
      console.log("authenticated");
    });
    socket.on("error", (error: any) => {
      console.log(error);
    });

    socket.on("IOTData", (data: IOTDAta[]) => {
      console.log("IOTData", data);
      // if any of the items data have value of 2147483647, set the value to zero
      // this is a bug in the iot device
      iotDataRef.current = [
        ...data.map((d) => {
          if (d.temperature === 2147483647) {
            d.temperature = 0;
          }
          if (d.humidity === 2147483647) {
            d.humidity = 0;
          }
          if (d.soilMoisture === 4095) {
            d.soilMoisture = 0;
          }
          return d;
        }),
        ...iotDataRef.current,
      ];
      setIotData((prev) =>
        [...data, ...prev].sort((a, b) => {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        })
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [user, setIotData]);

  const ref = React.useRef<HTMLDivElement>(null);

  const [bgDesings, setBgDesings] = React.useState({
    upperBgHeight: "50vh",
    lowerBgHeight: "0vh",
  });

  const setUpperBgHeight = (height: string) => {
    setBgDesings((prev) => ({ ...prev, upperBgHeight: height }));
  };

  return (
    <Box
      sx={{
        width: "100wv",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(16, 2, 35)",
        color: "white",
      }}
    >
      <Box
        sx={{
          // pb: 7,
          height: "100vh",
          width: { xs: "100vw", sm: "100vw", md: "400px" },
          position: "relative",
          bgcolor: "whitesmoke",
          pb: 7,
          overflow: "hidden",
        }}
        ref={ref}
      >
        <CssBaseline />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: bgDesings.upperBgHeight,
            // set gradient background
            backgroundImage:
              "linear-gradient(120deg,hsl(276, 87.60%, 77.80%) 0%,rgb(182, 71, 247) 100%)",
            // borderBottomLeftRadius: "50vw",
            // borderBottomRightRadius: "50vw",
            transition: "height 0.5s",
            transform: "skewY(-8deg)",
            boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.7)",
            display: !user ? "block" : "none",
          }}
        ></Box>
        {user ? (
          iotData.length ? (
            value === 0 ? (
              <Box
                sx={{
                  width: "100%",
                  bgcolor: "rgba(0, 0, 0, 0.1)",
                  height: "100%",
                  overflow: "auto",
                }}
              >
                {iotData.map((data, _index) => (
                  <Paper sx={{ m: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
                    <List>
                      <ListItemButton key={data.time}>
                        <ListItemIcon>
                          <RestoreIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={new Date(data.time).toLocaleString()}
                          secondary={`Battery Voltage: ${data.batteryVoltage}V, Temperature: ${data.temperature}°C, Humidity: ${data.humidity}%, Soil Moisture: ${data.soilMoisture}%, isCharging: ${data.isCharging}`}
                        />
                      </ListItemButton>
                    </List>
                  </Paper>
                ))}{" "}
              </Box>
            ) : value === 1 ? (
              <LineClickNoSnap data={iotData} />
            ) : (
              <MTable iotData={iotData} />
            )
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                color: "primary.main",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                width={"100%"}
                sx={{ textAlign: "center" }}
                gutterBottom
              >
                Waiting for data from server
              </Typography>
              <CircularProgress />
            </Box>
          )
        ) : (
          <Login adjustBgHeight={setUpperBgHeight} setUser={setUser} />
        )}
        <Paper
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: user ? "block" : "none",
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={value}
            onChange={(_event, newValue) => {
              console.log("old value", value, "new value", newValue);
              setValue(newValue);
            }}
          >
            <BottomNavigationAction label="List" icon={<ListAlt />} />
            <BottomNavigationAction label="Graph" icon={<AutoGraph />} />
            <BottomNavigationAction label="Table" icon={<TableChart />} />
          </BottomNavigation>
        </Paper>
        {user && (
          <SpeedDial
            ariaLabel="Download data"
            sx={{ position: "absolute", top: 5, right: 5 }}
            icon={
              downloading === "loading" ? (
                <CircularProgress size={20} color="secondary" />
              ) : downloading === "success" ? (
                <CheckBox />
              ) : downloading === "error" ? (
                <Error color="error" />
              ) : (
                <Download />
              )
            }
            direction="down"
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            FabProps={{
              color:
                downloading === "success"
                  ? "success"
                  : downloading === "error"
                  ? "error"
                  : "primary",
              size: "small",
            }}
          >
            {[
              {
                icon: <Code />,
                name: "JSON",
                action: () => {
                  setDownloading("loading");
                  setOpen(false);
                  downloadFile(API_URL + "/iot/data?type=json");
                },
              },
              {
                icon: <TableChart />,
                name: "CSV",
                action: () => {
                  setDownloading("loading");
                  setOpen(false);
                  downloadFile(API_URL + "/iot/data?type=csv");
                },
              },
            ].map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
          </SpeedDial>
        )}
      </Box>
      {/* <Paper
        sx={{
          postion: "fixed",
          right: 0,
          top: "10px",
          borderRadius: "10px 0 0 10px",
          zIndex: 1001,
        }}
        elevation={3}
        >
          hello
        </Paper> */}
    </Box>
  );
}
