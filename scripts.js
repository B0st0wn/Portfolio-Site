function projectInfo(project) {
    var description = "This is a brief description of " + project + ". More details coming soon!";
    var projectDescription = document.getElementById("projectDescription");
    
    if (projectDescription.innerText === description) {
        projectDescription.innerText = ""; // Hide the description
    } else {
        projectDescription.innerText = description; // Show the description
    }
}
