"use strict";

async function getData() {
    const kisboxData = await fetch("",{
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': '',
            'X-CLIENT-ID': ''
        }
    });

    const kislightData = await fetch("",{
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            'X-API-KEY': '',
            'X-CLIENT-ID': ''
        }
    });

    const kisboxJson = await kisboxData.json();
    const kislightJson = await kislightData.json();
    const flex = document.getElementById("flex");
    console.log(flex)

    flex.innerHTML += `<a href="rule_table/table.html">
                                    <div class="info">
                                        <h1>KIS.BOX</h1>
                                        <p>ID: ${kisboxJson.id}</p>
                                        <p>URN: ${kisboxJson.urn}</p>
                                        <p>NAME: ${kisboxJson.name}</p>
                                        <p>ONLINE: ${kisboxJson.isOnline ? "tak" : "nie"}
                                    </div>
                                </a>`;

    flex.innerHTML += `<a href="#">
                                    <div class="info">
                                        <h1>KIS.LIGHT</h1>
                                        <p>ID: ${kislightJson.id}</p>
                                        <p>URN: ${kislightJson.urn}</p>
                                        <p>NAME: ${kislightJson.name}</p>
                                        <p>ONLINE: ${kislightJson.isOnline ? "tak" : "nie"}
                                    </div>
                            </a>`;
}

getData();
