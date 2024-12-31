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
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import socketIOClient from "socket.io-client";
import Login from "./components/login/login";

interface IOTDAta {
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

function refreshMessages(): MessageExample[] {
  const getRandomInt = (max: number) =>
    Math.floor(Math.random() * Math.floor(max));

  return Array.from(new Array(50)).map(
    () => messageExamples[getRandomInt(messageExamples.length)]
  );
}

export default function FixedBottomNavigation() {
  const userRef = React.useRef<User | null>(null);
  const iotDataRef = React.useRef<IOTDAta[]>([]);
  const [iotData, setIotData] = React.useState<IOTDAta[]>(iotDataRef.current);
  const [value, setValue] = React.useState(0);
  const [user, setUser] = React.useState<User | null>(userRef.current);
  React.useEffect(() => {
    if(!user) return;
    userRef.current = user;
    const socket = socketIOClient("http://localhost:5000");
    socket.on("connect", () => {
      socket.emit("authenticate", user.token);
    });
    socket.on("unauthorized", () => {
      setUser(null);
    })

    socket.on("authenticated", () => {
      console.log("authenticated");
    });
    socket.on("error", (error: any) => {
      console.log(error);
    });
    
    socket.on("iotData", (data: IOTDAta) => {
      iotDataRef.current.push(data);
      setIotData(iotDataRef.current);
    });
    return () => {
      socket.disconnect();
    };
  }, [user, setIotData]);

  const ref = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState(() => refreshMessages());
  const [bgDesings, setBgDesings] = React.useState({
    upperBgHeight: "40vh",
    lowerBgHeight: "0vh",
  });

  const setUpperBgHeight = (height: string) => {
    setBgDesings((prev) => ({ ...prev, upperBgHeight: height }));
  };
  React.useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
    setMessages(refreshMessages());
  }, [value, setMessages]);

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
          pb: 7,
          height: "100vh",
          width: { xs: "100vw", sm: "100vw", md: "400px" },
          position: "relative",
          bgcolor: "whitesmoke",
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
              "linear-gradient(90deg,hsl(266, 88.90%, 57.50%) 0%,rgb(228, 160, 233) 100%)",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            transition: "height 0.5s",
          }}
        ></Box>
        {user ? (
          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            {messages.map(({ primary, secondary, person }, index) => (
              <ListItemButton key={index}>
                <ListItemAvatar>
                  <Avatar alt="Profile Picture" src={person} />
                </ListItemAvatar>
                <ListItemText primary={primary} secondary={secondary} />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Login adjustBgHeight={setUpperBgHeight} setUser={setUser} />
        )}
        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          >
            <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
            <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
            <BottomNavigationAction label="Archive" icon={<ArchiveIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}

interface MessageExample {
  primary: string;
  secondary: string;
  person: string;
}

const messageExamples: readonly MessageExample[] = [
  {
    primary: "Brunch this week?",
    secondary:
      "I'll be in the neighbourhood this week. Let's grab a bite to eat",
    person: "/static/images/avatar/5.jpg",
  },
  {
    primary: "Birthday Gift",
    secondary: `Do you have a suggestion for a good present for John on his work
      anniversary. I am really confused & would love your thoughts on it.`,
    person: "/static/images/avatar/1.jpg",
  },
  {
    primary: "Recipe to try",
    secondary:
      "I am try out this new BBQ recipe, I think this might be amazing",
    person: "/static/images/avatar/2.jpg",
  },
  {
    primary: "Yes!",
    secondary: "I have the tickets to the ReactConf for this year.",
    person: "/static/images/avatar/3.jpg",
  },
  {
    primary: "Doctor's Appointment",
    secondary:
      "My appointment for the doctor was rescheduled for next Saturday.",
    person: "/static/images/avatar/4.jpg",
  },
  {
    primary: "Discussion",
    secondary: `Menus that are generated by the bottom app bar (such as a bottom
      navigation drawer or overflow menu) open as bottom sheets at a higher elevation
      than the bar.`,
    person: "/static/images/avatar/5.jpg",
  },
  {
    primary: "Summer BBQ",
    secondary: `Who wants to have a cookout this weekend? I just got some furniture
      for my backyard and would love to fire up the grill.`,
    person: "/static/images/avatar/1.jpg",
  },
];
