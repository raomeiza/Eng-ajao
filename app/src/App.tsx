import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import socketIOClient from "socket.io-client";
import Login from "./components/login/login";
import {
  ListItemIcon,
} from "@mui/material";
import LineClickNoSnap from "./components/chart";
import MTable from "./components/table";
import { AutoGraph, ListAlt, TableChart } from "@mui/icons-material";

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

  React.useEffect(() => {
    if (iotDataRef.current.length > 0 && iotData.length === 0) {
      setIotData(iotDataRef.current);
    }
  }, [iotData, setIotData]);

  React.useEffect(() => {
    if (!user) return;
    userRef.current = user;
    const socket = socketIOClient("https://dv25fnzj-5000.uks1.devtunnels.ms", {
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
      iotDataRef.current = [...data.map((d) => {
        
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
      }), ...iotDataRef.current];
      setIotData((prev) => [...data, ...prev].sort((a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      }));

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
          value === 0 ? (
          <Box
            sx={{
              width: "100%",
              bgcolor: "rgba(0, 0, 0, 0.1)",
              height: "100%",
              overflow: "auto",
            }}
          >
            {iotData.map((data, index) => (
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
            onChange={(event, newValue) => {
              console.log("old value", value, "new value", newValue);
              setValue(newValue);
            }}
          >
            <BottomNavigationAction label="List" icon={<ListAlt />} />
            <BottomNavigationAction label="Graph" icon={<AutoGraph />} />
            <BottomNavigationAction label="Table" icon={<TableChart />} />
          </BottomNavigation>
        </Paper>
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

