"use strict"

async function save()
{
    //get data from form
    const id = document.getElementById("rule_name").value
    const condition = document.querySelector('input[name="condition"]:checked').value;
    const action = document.querySelector('input[name="action"]:checked').value;

    //read rule file
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

    //get and parse old json
    const file = await fileHandle.getFile();
    const text = await file.text();
    const rules = JSON.parse(text);

    //add new rule
    const rule = {
        "id": id,
        "condition": {"color": condition, "rel": true},
        "action": action
    };
    rules.rules.push(rule);

    // override rule file
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(JSON.stringify(rules));
    await writableStream.close();
}

const saveBtn = document.getElementById("savebtn");
saveBtn.addEventListener("click", save);
