document.addEventListener("DOMContentLoaded", function () {
    const continueBtn = document.getElementById("continue-btn");
    const introPage = document.getElementById("intro-page");
    const mainApp = document.getElementById("main-app");
    const collegeSearchInput = document.getElementById("college-search");
    const suggestionsContainer = document.getElementById("suggestions");
    const calculateBtn = document.getElementById("calculate-btn");
    const costDisplay = document.getElementById("cost-display");
    const residencySelect = document.getElementById("residency-select");
    const collegeButtonsContainer = document.getElementById("college-buttons-container");
    const goButton = document.getElementById("go-button");
    const collegeWebsiteButton = document.getElementById("college-website-button");

    let colleges = [];
    let collegeLinks = [];
    let collegeCities = [];
    let collegeStates = [];
    let selectedCollegeIndex = -1;

    // Google API credentials
    const googleApiKey = "AIzaSyByIj5HheJZEZh-yl0Htqb8tjLNQvRG0gg"; // Replace with your Google API Key
    const googleCx = "057634c68697e4dfc"; // Replace with your Custom Search Engine ID

    // Fetch college names and links from Google Sheets
    const fetchColleges = async () => {
        const apiKey = "AIzaSyCfrP-vedjtT-jxoXR9Adco8YUV2cRyUaY"; // Replace with your actual API Key
        const spreadsheetId = "1SCwi8zWoxq9pa2LSmu0dfcakdju8RCYZ7n51_Fgprfc"; // Replace with your spreadsheet ID
        const range = "Sheet1!A:D"; // Fetch both columns A (college names), B (URLs), C (Cities), D (States)
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.values) {
                colleges = data.values.map(row => row[0]); // Column A: college names
                collegeLinks = data.values.map(row => row[1]); // Column B: college links
                collegeCities = data.values.map(row => row[2]); // Column C: city
                collegeStates = data.values.map(row => row[3]); // Column D: state
            }
        } catch (error) {
            console.error("Error fetching college names and links from Google Sheets:", error);
        }
    };

    // Handle the "Continue" button click
    continueBtn.addEventListener("click", function () {
        introPage.style.display = "none";
        mainApp.style.display = "flex";
    });

    // Handle college search input
    collegeSearchInput.addEventListener("input", function () {
        const query = collegeSearchInput.value.toLowerCase();
        if (query.length > 0) {
            showSuggestions(query);
        } else {
            suggestionsContainer.innerHTML = ''; // Clear suggestions when input is empty
        }
    });

    // Show college suggestions based on the query
    function showSuggestions(query) {
        const filteredColleges = colleges.filter((college) =>
            college.toLowerCase().includes(query)
        );

        suggestionsContainer.innerHTML = ''; // Clear previous suggestions
        if (filteredColleges.length === 0) {
            suggestionsContainer.innerHTML = '<div>No results found</div>';
        } else {
            filteredColleges.forEach((college) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = college;

                // Add event listener to handle college selection
                suggestionItem.addEventListener('click', function () {
                    collegeSearchInput.value = college;
                    suggestionsContainer.innerHTML = ''; // Clear suggestions after selection

                    // Set the selected college index
                    selectedCollegeIndex = colleges.indexOf(college);

                    // Make the "Go" button visible
                    goButton.style.display = 'inline-block';

                    // Display the college name and city/state
                    const collegeName = colleges[selectedCollegeIndex];
                    const city = collegeCities[selectedCollegeIndex];
                    const state = collegeStates[selectedCollegeIndex];
                    document.getElementById('college-name').textContent = collegeName;
                    document.getElementById('college-location').textContent = `${city}, ${state}`;

                    // Fetch image from Google API
                    fetchCollegeImage(collegeName);
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        }
    }

    // Fetch college image using Google Custom Search API
    async function fetchCollegeImage(collegeName) {
        const searchQuery = `${collegeName} logo`;
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(searchQuery)}&cx=${googleCx}&key=${googleApiKey}&searchType=image`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            // Check if there's at least one result
            if (data.items && data.items.length > 0) {
                const imageUrl = data.items[0].link;
                const imageElement = document.getElementById('college-image');
                imageElement.src = imageUrl;
                imageElement.style.display = 'block';
            } else {
                // If no logo is found, hide the image
                document.getElementById('college-image').style.display = 'none';
            }
        } catch (error) {
            console.error("Error fetching college image:", error);
            document.getElementById('college-image').style.display = 'none'; // Hide image on error
        }
    }

    // Handle "Go" button click
    goButton.addEventListener("click", function () {
        if (selectedCollegeIndex !== -1) {
            // Update the "View College Website" button with the correct link
            const link = collegeLinks[selectedCollegeIndex];

            // Make the "View College Website" button visible and update its link
            collegeWebsiteButton.style.display = "inline-block";
            collegeWebsiteButton.setAttribute("onclick", `window.open('${link}', '_blank')`);
        } else {
            alert("Please select a college first!");
        }
    });

    // Handle "Calculate Cost" button click
    calculateBtn.addEventListener("click", function () {
        const collegeName = collegeSearchInput.value.trim();
        const residency = residencySelect.value;

        if (collegeName === "") {
            alert("Please select a college!");
            return;
        }

        // For simplicity, we'll use a static cost for each college
        const tuitionCost = residency === "in-state" ? 10000 : 20000;
        const totalCost = tuitionCost + 5000; // Add some additional costs (e.g., housing, food)

        // Display total cost
        costDisplay.textContent = `Total Cost for ${collegeName}: $${totalCost.toFixed(2)}`;
    });

    // Call the function to fetch colleges data on page load
    fetchColleges();
});
