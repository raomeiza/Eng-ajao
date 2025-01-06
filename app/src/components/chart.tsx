import * as React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { LineChart } from "@mui/x-charts/LineChart";
import { IOTDAta } from "../App";
import Paper from "@mui/material/Paper";

// import { HighlightedCode } from '@mui/docs/HighlightedCode';

export default function LineClickNoSnap({ data }: { data: IOTDAta[] }) {
  data = [...data.reverse()];
  const lineChartsParams = {
    series: [
      {
        id: "temperature",
        data: data.map((d) => d?.temperature),
        label: "Temperature",
        //   area: true,
        stack: "total",
        highlightScope: {
          highlight: "item",
        },
      },
      {
        id: "humidity",
        data: data.map((d) => d?.humidity),
        label: "Humidity",
        //   area: true,
        stack: "total",
        highlightScope: {
          highlight: "item",
        },
      },
      {
        id: "soilMoisture",
        data: data.map((d) => d?.soilMoisture),
        label: "Soil Moisture",
        //   area: true,
        stack: "total",
        highlightScope: {
          highlight: "item",
        },
      },
    ],
    height: 400,
  };
  const [itemData, setItemData] = React.useState<any>(null);

  React.useEffect(() => {
    console.log("itemData", itemData);
  }, [itemData]);
  return (
    <Stack
      direction={{ xs: "column" }}
      spacing={{ xs: 0, md: 4 }}
      sx={{ width: "100%" }}
      py={1}
    >
      <Paper
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "primary.main",
          backgroundImage: "linear-gradient(315deg,rgb(223, 144, 245) 0%,rgb(151, 56, 172) 74%)",
          margin: 20,
          width: "100%",
        }}
      >
        {!itemData ? (
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Click on the line chart to see the data
          </Typography>
        ) : (
          Object.keys(data[0]).map((key) => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "space-between",
                color: "rgba(205, 67, 226, 0.6)",
                px: 1,
                py: 0.5,
                backgroundColor: "white",
                borderRadius: 3,
                width: "100%",
                marginY: 0.5,
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body1" key={key}>
                {key}
              </Typography>
              <Typography variant="body1" key={key}>
                {/* @ts-ignore */}
                {data[itemData.dataIndex][key]}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
      <Box sx={{ flexGrow: 1 }}>
        {/* @ts-ignore */}
        <LineChart
          {...lineChartsParams}
          //   onAreaClick={(event, d) => setItemData(d)}
          onMarkClick={(_event, d) => {
            console.log("d", d);
            setItemData(d)
          }}
          //   onLineClick={(event, d) => setItemData(d)}
          //   onAxisClick={(event, d) => setAxisData(d)}
        />
      </Box>
    </Stack>
  );
}
