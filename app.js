// DOM ELEMENTS
const createForm = document.querySelector("#createForm");
const createFormBtn = document.querySelector("#createFormBtn");
const updateFormBtn = document.querySelector("#updateFormBtn");
const cancelEditBtn = document.querySelector("#cancelEditBtn");

const searchBox = document.querySelector("#searchBox");
const searchBtn = document.querySelector("#searchBtn");

const sort = document.querySelector("#sort");

const tableBody = document.querySelector("#tableBody");

let draggedItem = null;

// NOTIFICATION ITEM
const notification = document.querySelector("#notification");
const notificationBody = document.querySelector("#notificationBody");
const notificationCloseBtn = document.querySelector("#notificationCloseBtn");

// CURRENT PRODUCTS
let products = localStorage.getItem("products")
    ? JSON.parse(localStorage.getItem("products"))
    : [];

// DRAG ON MOUSE DOWN
const dragOnMouseDown = (e) => {
    const element = e.parentElement;

    if (element.tagName === "TR") {
        element.setAttribute("draggable", "true");

        window.addEventListener(
            "dragend",
            () => {
                element.setAttribute("draggable", "false");
            },
            { once: true }
        );
    }
};

// DRAG OFF ON MOUSE UP
const dragOffOnMouseUp = (e) => {
    const element = e.parentElement;
    element.setAttribute("draggable", "false");
};

// TRACK DRAG START
const dragStart = (e) => {
    const element = e.target.classList.contains("column")
        ? e.target
        : e.target.closest(".column");
    if (element) {
        draggedItem = element.dataset.id;
        element.classList.add("draggedItem");
    }
};

// ALLOW DRAG ON DRAG OVER
const allowDrag = (e) => e.preventDefault();

// TRACK DRAG DROP
const dragDrop = (e) => {
    e.preventDefault();

    const element = e.target.classList.contains("column")
        ? e.target
        : e.target.closest(".column");
    if (element) {
        organizeColumn(draggedItem, element.dataset.id);
    }
};

// TRACK DRAG END
const dragEnd = (e) => {
    e.target.classList.remove("draggedItem");
    draggedItem = null;
};

// ORGANIZE COLUMNS
const organizeColumn = (firstID, secondID) => {
    const firstIndex = products.findIndex((p) => p.id === firstID);
    const secondIndex = products.findIndex((p) => p.id === secondID);

    if (firstIndex !== -1 && secondIndex !== -1) {
        const allProducts = [...products];

        allProducts[firstIndex] = products[secondIndex];
        allProducts[secondIndex] = products[firstIndex];

        products = allProducts;
        localStorage.setItem("products", JSON.stringify(allProducts));
        createTableColumn(allProducts);
    }
};

// GENERATE UNIQUE ID
const genUniqueId = (count) => {
    // RANDOM UPPERCASE LOWERCASE LETTER
    const letter = () =>
        String.fromCharCode(
            Math.floor(Math.random() * 26) +
                [97, 65][Math.floor(Math.random() * 2)]
        );
    // RANDOM NUMBER
    const number = () => Math.floor(Math.random() * 10);

    // OPTIONS
    const options = [letter, number];

    // VALIDATE CODE
    const validate = (code) => {
        return products.every((product) => product.id !== code);
    };

    // GENERATE CODE
    const gen = () => {
        let id = "";
        for (let i = 0; i < count; i++) {
            id += options[Math.floor(Math.random() * options.length)]();
        }

        return validate(id) ? id : gen();
    };

    return gen();
};

// CREATE FORM TOGGLE
const createFormToggle = (type) => {
    if (type === "CREATE") {
        // FORM
        createForm.reset();
        createForm.setAttribute("data-type", "CREATE");

        // UPDATE BUTON
        updateFormBtn.classList.add("d-none");
        // CREATE BUTTON
        createFormBtn.classList.add("w-100");
        createFormBtn.classList.remove("d-none");
        // CANCEL EDIT BUTTON
        cancelEditBtn.classList.add("d-none");
    } else {
        // FORM
        createForm.reset();
        createForm.setAttribute("data-type", "UPDATE");

        // UPDATE BUTON
        updateFormBtn.classList.remove("d-none");
        updateFormBtn.classList.add("w-100");

        // CREATE BUTTON
        createFormBtn.classList.add("d-none");
        // CANCEL EDIT BUTTON
        cancelEditBtn.classList.remove("d-none");
    }
};

// CREATE TABLE COLUMN
const createTableColumn = (data) => {
    // CLEAR TABLE CURRENT HTML
    tableBody.innerHTML = "";
    let cost = 0;

    if (data.length) {
        const state = [...data].sort((a, b) => {
            switch (sort.value) {
                case "PRICEHIGHTOLOW":
                    return b.price - a.price;
                case "PRICELOWTOHIGH":
                    return a.price - b.price;
                case "QUANTITYHIGHTOLOW":
                    return b.quantity - a.quantity;
                case "QUANTITYLOWTOHIGH":
                    return a.quantity - b.quantity;
                case "TOTALPRICEHIGHTOLOW":
                    return b.total - a.total;
                case "TOTALPRICELOWTOHIGH":
                    return a.total - b.total;
                case "NAMEASCENDING":
                    return a.name
                        .toLowerCase()
                        .localeCompare(b.name.toLowerCase());
                case "NAMEDESENDING":
                    return b.name
                        .toLowerCase()
                        .localeCompare(a.name.toLowerCase());
                default:
                    return true;
            }
        });

        state.map((dataItem, index) => {
            const column = `
            <tr style="user-select : none" data-id="${
                dataItem.id
            }" class="column">
                <th class="id" scope="row" onmousedown="dragOnMouseDown(this)" onmouseup="dragOffOnMouseUp(this)" >
                <span class="text">${index + 1}</span>
                <span class=" d-none icon">#</span>
                </th>
                <td colspan="2" >${dataItem.name}</td>
                <td>${dataItem.price}</td>
                <td>${dataItem.quantity}</td>
                <td>${dataItem.total}</td>
                <td class="text-end" data-print="false">
                    <div class="d-flex gap-1 justify-content-end align-items-center">
                        <button class="btn btn-warning btn-sm shadow-none" onclick="updateTableButton('${
                            dataItem.id
                        }')"><span class="bi bi-gear-fill"></span></button>
                        <button class="btn btn-danger btn-sm shadow-none" onclick="deleteTableColumn('${
                            dataItem.id
                        }')"><span class="bi bi-trash"></span></button>
                    </div>
                </td>
            </tr>
            `;

            cost += dataItem.total;

            tableBody.innerHTML += column;
        });

        [...tableBody.querySelectorAll("tr")].forEach((item) => {
            item.addEventListener("dragstart", dragStart);
            item.addEventListener("dragover", allowDrag);
            item.addEventListener("drop", dragDrop);
            item.addEventListener("dragend", dragEnd);
        });
    } else {
        tableBody.innerHTML =
            '<td colspan="7" class="text-center w-100 small text-muted py-4" ><span class="bi bi-emoji-frown"></span> sorry no more products</td>';
    }

    document.getElementById("cost").innerHTML = cost;
};

// DELETE TABLE COLUMN
const deleteTableColumn = (id) => {
    if (id === createForm.dataset.id) {
        notificationBody.innerHTML = "this item in editing mode";
        notification.classList.add("show", "bg-danger");
    } else {
        const state = [...products].filter((product) => product.id !== id);

        // UPDATE DATA
        products = [...state];
        localStorage.setItem("products", JSON.stringify(products));
        createTableColumn(products);
    }
};

// UPDATE TABLE BUTTON
const updateTableButton = (id) => {
    const item = [...products].find((p) => p.id === id);

    if (item) {
        createFormToggle("UPDATE");
        createForm.name.value = item.name;
        createForm.price.value = item.price;
        createForm.quantity.value = item.quantity;
        createForm.dataset.id = item.id;
    } else {
        alert("column id not found");
    }
};

// SUBMIT DATA
const submitData = (data, type = "CREATE") => {
    let allProducts = [];

    if (type === "UPDATE") {
        allProducts = [...products].map((p) => (p.id === data.id ? data : p));
        createFormToggle("CREATE");
    } else {
        allProducts = [...products, data];
    }

    localStorage.setItem("products", JSON.stringify(allProducts));
    products = [...allProducts];
    createTableColumn(products);
};

// HANDLE CREATE FORM
const handleCreateForm = (e) => {
    // PREVENT DEFAULT FORM BEHAVIOR
    e.preventDefault();

    const data = {};

    data.name = e.target.name.value;
    data.price = parseInt(e.target.price.value, 10);
    data.quantity = parseInt(e.target.quantity.value, 10);
    data.total = data.price * data.quantity;
    data.id =
        e.target.dataset.type === "UPDATE"
            ? e.target.dataset.id
            : genUniqueId(10);

    // SUBIMT A DATA
    submitData(data, e.target.dataset.type === "UPDATE" ? "UPDATE" : "CREATE");
    // RESET FORM
    e.target.reset();
    e.target.dataset.id = "";
};

// HANDLE SEARCH FORM
const handleSearch = (e) => {
    const query = e.target.value;

    if (query.length) {
        // GET SEARCHED ITEMS
        const searchedItems = products.filter((product) =>
            product.name.includes(query)
        );

        searchBtn.innerHTML = '<span class="bi bi-x-lg"></span>';

        createTableColumn(searchedItems);
    } else {
        searchBtn.innerHTML = '<span class="bi bi-search"></span>';
        createTableColumn(products);
    }
};

// HANDLE SEARCH BUTTON
const handleSearchBtn = () => {
    if (searchBox.value.length) {
        searchBox.value = "";
        searchBtn.innerHTML = '<span class="bi bi-search"></span>';
        createTableColumn(products);
    } else {
        searchBox.focus();
        searchBtn.innerHTML = '<span class="bi bi-x-lg"></span>';
    }
};

// HANDLE SORT ITEM
const handleSort = () => createTableColumn(products);

// EXPORT TO JSON FILE
function exportToJsonFile() {
    let dataStr = JSON.stringify(products, null, 4);
    let dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const date = new Date();

    let exportFileDefaultName = `${prompt(
        "File Save As : ",
        "CRUD"
    )} - ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.json`;

    let linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
}

// HANDLE EVENTS
createForm.addEventListener("submit", handleCreateForm);

searchBox.addEventListener("input", handleSearch);
searchBtn.addEventListener("click", handleSearchBtn);

sort.addEventListener("change", handleSort);

cancelEditBtn.addEventListener("click", () => createFormToggle("CREATE"));

notificationCloseBtn.addEventListener("click", () =>
    notification.classList.remove("show")
);

// SET TABLE DATA
createTableColumn(products);
