import "./index.css";

const GRID_SELECTOR = "[data-projects-grid]";
const STATUS_SELECTOR = "[data-projects-status]";
const DATA_URL = "data/projects.json";

const updateStatus = (statusElement, message = "") => {
	if (!statusElement) {
		return;
	}

	if (message) {
		statusElement.textContent = message;
		statusElement.hidden = false;
	} else {
		statusElement.hidden = true;
	}
};

const createProjectCard = ({ title, description, url, linkText }) => {
	const wrapper = document.createElement("div");
	wrapper.className = "grid-item";

	const projectTitle = document.createElement("h2");
	projectTitle.className = "project-title";
	projectTitle.textContent = title ?? "Untitled Project";

	const projectDescription = document.createElement("p");
	projectDescription.className = "project-description";
	projectDescription.textContent = description ?? "More details coming soon.";

	const projectLink = document.createElement("a");
	projectLink.className = "project-link";
	projectLink.href = url ?? "#";
	projectLink.textContent = linkText ?? "Learn more";
	wrapper.append(projectTitle, projectDescription, projectLink);
	return wrapper;
};

const renderProjects = async () => {
	const grid = document.querySelector(GRID_SELECTOR);
	const status = document.querySelector(STATUS_SELECTOR);

	if (!grid) {
		return;
	}

	try {
		updateStatus(status, "Loading projects…");

		const response = await fetch(DATA_URL, { cache: "no-store" });
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		const payload = await response.json();
		const projects = Array.isArray(payload)
			? payload
			: Array.isArray(payload?.projects)
				? payload.projects
				: [];

		if (!projects.length) {
			throw new Error("Received empty project list");
		}

		const fragment = document.createDocumentFragment();
		projects.forEach((project) => {
			fragment.append(createProjectCard(project));
		});

		grid.replaceChildren(fragment);
		updateStatus(status);
	} catch (error) {
		grid.textContent = "";
		updateStatus(status, "Unable to load projects right now. Please try again later.");
		console.error("Failed to render projects:", error);
	}
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", renderProjects);
} else {
	renderProjects();
}
