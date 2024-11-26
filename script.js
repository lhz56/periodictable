let allData = {};
const colors = {
    "s": "#FFE900",
    "p": "#49faed",
    "d": "#7fff00",
    "f": "#f39c5f"
};

// Fetch data from the new API
async function getData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.elements; // Adjusted to match this API's structure
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return []; // Return empty array on error to avoid breaking the app
    }
}

let dataPromise = getData();
const mainDiv = document.getElementById("main-grid");

// Function to add one element to the grid
function addChild(name, symbol, atomicNumber, block, groupBlock) {
    const div = document.createElement('div');
    div.className = `element ${block}-block ${groupBlock}`;
    div.setAttribute('data-name', name);
    div.setAttribute('data-block', block);

    const p1 = document.createElement('p');
    p1.innerText = atomicNumber;
    const p2 = document.createElement('p');
    p2.innerText = symbol;

    div.appendChild(p1);
    div.appendChild(p2);
    mainDiv.appendChild(div);
}

// Populate the periodic table grid
dataPromise.then(data => {
    allData = data;
    data.forEach(element => {
        const { name, symbol, number: atomicNumber, category, xpos: column, ypos: row } = element;

        // Determine block based on category
        let block = "";
        if (category.includes("alkali") || category.includes("alkaline")) {
            block = "s";
        } else if (category.includes("transition")) {
            block = "d";
        } else if (category.includes("lanthanoid") || category.includes("actinoid")) {
            block = "f";
        } else {
            block = "p";
        }

        // Add element to the grid
        addChild(name, symbol, atomicNumber, block, category);

        // Handle special cases (e.g., Lanthanides, Actinides)
        if (atomicNumber === 57) {
            addChild("Lanthanides", "La-Lu", "57-71", "extra", "");
        }
        if (atomicNumber === 89) {
            addChild("Actinides", "Ac-Lr", "89-103", "extra", "");
        }
    });

    // Add event listeners for hover and click
    addElementListeners();
});

// Add hover and click listeners for elements
function addElementListeners() {
    const cells = document.querySelectorAll('.element');
    const selectedElement = document.getElementById("selectedElementName");

    cells.forEach(element => {
        // Hover effect to display the element's name
        element.addEventListener('mousemove', () => {
            selectedElement.innerHTML = element.getAttribute("data-name");
        });
        element.addEventListener('mouseout', () => {
            selectedElement.innerHTML = "";
        });

        // Click to show popup with details
        element.addEventListener('click', () => showPopup(element));
    });
}

// Display popup with element details
function showPopup(element) {
    const overlay = document.querySelector(".overlay");
    overlay.style.visibility = "visible";
    overlay.style.opacity = 1;

    const elementData = allData.find(x => x.name === element.getAttribute("data-name"));

    if (!elementData) return; // Handle case where data is not found

    // Populate popup content
    document.querySelector("#element-name").innerHTML = `${elementData.name} (${elementData.symbol})`;
    document.querySelector("#block-name").innerHTML = `${elementData.category}`;

    // Fill other details
    [
        "number", "atomic_mass", "phase", "boil", "melt",
        "density", "discovered_by", "shells"
    ].forEach(field => {
        document.querySelector(`#${field}`).innerHTML = elementData[field] || "N/A";
    });
}

// Close popup
document.querySelector(".close").addEventListener('click', () => {
    const overlay = document.querySelector(".overlay");
    overlay.style.visibility = "hidden";
    overlay.style.opacity = 0;
});
