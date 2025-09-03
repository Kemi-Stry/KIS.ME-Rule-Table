"use strict";

// rule set loaded from file
let rules;

// normal color map
const Color = new Map([
  ["#0000FF", "blue"],
  ["#00FFFF", "turquoise"],
  ["#000000", "black"],
  ["#00FF00", "green"],
  ["#FF00FF", "magenta"],
  ["#FF0000", "red"],
  ["#FFFFFF", "white"],
  ["#FFFF00", "yellow"],
  // mirror
  ["blue", "#0000FF"],
  ["turquoise", "#00FFFF"],
  ["black", "#000000"],
  ["green", "#00FF00"],
  ["magenta", "#FF00FF"],
  ["red", "#FF0000"],
  ["white", "#FFFFFF"],
  ["yellow", "#FFFF00"],
]);

// api color map
const LedColor = new Map([
  ["blue", "blue"],
  ["turquoise", "turquoise"],
  ["black", "black"],
  ["green", "green"],
  ["magenta", "purple"],
  ["red", "red"],
  ["white", "white"],
  ["yellow", "yellow"],
]);

// table row color enum
const TableColor = {
  green: 1,
  red: 2,
  blue: 3,
  yellow: 4,
  turquoise: 5,
  magenta: 6,
  white: 7,
  black: 8,
};

//load rules from file
async function loadRules() {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: "Rules JSON",
        accept: {
          "application/json": [".json"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  });

  const file = await fileHandle.getFile();
  const text = await file.text();
  rules = JSON.parse(text);

  // get rows of conditions and actions tables
  const conditions_rows = document.querySelectorAll("#conditions_tab .row");
  const actions_rows = document.querySelectorAll("#actions_tab .row");

  // draw conditions and actions table
  for (let i = 0; i < rules.rules.length; i++) {
    conditions_rows[0].innerHTML += `<div class="col"><p>${"Rule" + (i + 1)}</p></col>`;
    actions_rows[0].innerHTML += `<div class="col"><p>${"Rule" + (i + 1)}</p></col>`;

    for (let j = 1; j <= 8; j++) {
      const color = conditions_rows[j].innerText.substring(8, text.length);

      // draw conditions
      if (color.toUpperCase() == rules.rules[i].condition.color.toUpperCase())
        conditions_rows[j].innerHTML += `<div class="col"><p>True</p></col>`;
      else conditions_rows[j].innerHTML += `<div class="col"><p></p></div>`;

      // draw actions
      if (color.toUpperCase() == rules.rules[i].action.toUpperCase())
        actions_rows[j].innerHTML += `<div class="col"><p>X</p></col>`;
      else actions_rows[j].innerHTML += `<div class="col"><p></p></div>`;
    }
  }

  highlight(rules.rules[0].condition.color);
  //set led1 color to first color in rule set
  setLed(LedColor.get(rules.rules[0].condition.color));
}

//LED1 change color
async function setLed(color) {
  await fetch("",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "",
        "X-CLIENT-ID": "",
      },
      body: JSON.stringify({
        color: color,
        flashing: false,
        target: "led1",
      }),
    },
  );
}

// highlight current color column
function highlight(color) {
  const conditions_rows = document.querySelectorAll("#conditions_tab .row");
  // clear background
  for (const row of conditions_rows) {
    row.style.backgroundColor = "transparent";
  }
  // set row background color
  conditions_rows[TableColor[color]].style.backgroundColor = Color.get(color);
}

//get credentials to websocket connection
async function getCredentials() {
  const response = await fetch("", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": "",
      "X-CLIENT-ID": "",
    },
    body: JSON.stringify({
      assetIds: [2924],
      subscribeTo: "datapoint",
    }),
  });
  return await response.json();
}

// add websocket event listener
getCredentials().then((response) => {
  const uri = response.subscriptionUris[0];
  const id = response.subscriptionId;
  const socket = new WebSocket(uri);

  // websocket connection
  socket.addEventListener("open", () => {
    socket.send("CONNECT\naccept-version:1.2\nhost:wss://pubsub.centersightcloud.com\ncontent-type:text/plain\n\n\x00");
    socket.send(`SUBSCRIBE\nid:0\ndestination:/topic/${id}\nack:client\n\n\x00`);
  });

  // message handler
  socket.addEventListener("message", (event) => {
    console.log("Message: ", event.data);
    const data = event.data.split("\n");
    const text = data[10].substring(0, data[10].length - 1);
    //console.log("lul", text);
    const json = JSON.parse(text);

    // check for button1 color info
    if (json.info.key === "button1Color") {
      console.log("VALUE: ", json.info.value);
      // loop throught rule set for action color
      for (const rule of rules.rules) {
        if (rule.condition.color == Color.get(json.info.value)) {
          // set led to action color
          //setLed(LedColor.get(Color.get(json.info.value)));
          setLed(LedColor.get(rule.action));
          // highlight row
          highlight(Color.get(json.info.value));
        }
      }
    }
  });

  // close websocket connection
  socket.addEventListener("close", (event) => {
    console.log("Connection closed:", event.reason);
  });

  //websocket connection error
  socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
  });
});

const loader = document.getElementById("load");
loader.addEventListener("click", () => loadRules());
