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

const createDetailsList = (details) => {
	if (!Array.isArray(details) || details.length === 0) {
		return null;
	}

	const section = document.createElement("section");
	section.className = "project-expanded__section";

	const heading = document.createElement("h3");
	heading.className = "project-expanded__heading";
	heading.textContent = "Highlights";
	section.append(heading);

	const list = document.createElement("ul");
	list.className = "project-expanded__details-list";
	details.forEach((detail) => {
		if (!detail) {
			return;
		}
		const item = document.createElement("li");
		item.textContent = detail;
		list.append(item);
	});
	section.append(list);
	return section;
};

const createMediaBlock = (media, fallbackTitle) => {
	if (!media || !media.src) {
		return null;
	}

	const wrapper = document.createElement("section");
	wrapper.className = "project-expanded__section project-expanded__section--media";

	const heading = document.createElement("h3");
	heading.className = "project-expanded__heading";
	heading.textContent = media.type === "video" ? "Preview" : "Snapshot";
	wrapper.append(heading);

	if (media.type === "video") {
		const video = document.createElement("video");
		video.className = "project-expanded__media";
		video.src = media.src;
		video.controls = true;
		video.preload = "metadata";
		video.playsInline = true;
		if (media.poster) {
			video.poster = media.poster;
		}
		wrapper.append(video);
	} else {
		const image = document.createElement("img");
		image.className = "project-expanded__media";
		image.src = media.src;
		image.alt = media.alt ?? `${fallbackTitle ?? "Project"} preview`;
		image.loading = "lazy";
		wrapper.append(image);
	}

	return wrapper;
};


const createExpandedContent = (project) => {
	const root = document.createElement("div");
	root.className = "project-expanded";
	root.setAttribute("aria-hidden", "true");

	const backdrop = document.createElement("div");
	backdrop.className = "project-expanded__backdrop";

	const panel = document.createElement("article");
	panel.className = "project-expanded__panel";
	panel.setAttribute("aria-label", `${project.title ?? "Project"} details`);

	const header = document.createElement("header");
	header.className = "project-expanded__header";

	const title = document.createElement("h2");
	title.className = "project-expanded__title";
	title.textContent = project.title ?? "Untitled Project";

	const summary = document.createElement("p");
	summary.className = "project-expanded__description";
	summary.textContent = project.description ?? "More details coming soon.";

	const cta = document.createElement("a");
	cta.className = "project-expanded__link";
	cta.href = project.url ?? "#";
	cta.textContent = project.linkText ?? "Learn more";
	cta.target = "_blank";
	cta.rel = "noopener noreferrer";

	header.append(title, summary, cta);

	const body = document.createElement("div");
	body.className = "project-expanded__body";

	const detailsSection = createDetailsList(project.details);
	if (detailsSection) {
		body.append(detailsSection);
	}

	const mediaSection = createMediaBlock(project.media, project.title);
	if (mediaSection) {
		body.append(mediaSection);
	}

	panel.append(header, body);
	root.append(backdrop, panel);

	return { root, backdrop, panel };
};

const createProjectCard = (project) => {
	const wrapper = document.createElement("div");
	wrapper.className = "grid-item";
	wrapper.tabIndex = 0;

	const summary = document.createElement("div");
	summary.className = "project-summary";

	const projectTitle = document.createElement("h2");
	projectTitle.className = "project-title";
	projectTitle.textContent = project.title ?? "Untitled Project";

	const projectDescription = document.createElement("p");
	projectDescription.className = "project-description";
	projectDescription.textContent = project.description ?? "More details coming soon.";

	const projectLink = document.createElement("a");
	projectLink.className = "project-link";
	projectLink.href = project.url ?? "#";
	projectLink.textContent = project.linkText ?? "Learn more";

	summary.append(projectTitle, projectDescription, projectLink);
	const expanded = createExpandedContent(project);

	const showExpanded = () => {
		wrapper.classList.add("grid-item--expanded");
		expanded.root.setAttribute("aria-hidden", "false");
	};

	const hideExpanded = (event) => {
		if (event?.relatedTarget && wrapper.contains(event.relatedTarget)) {
			return;
		}
		wrapper.classList.remove("grid-item--expanded");
		expanded.root.setAttribute("aria-hidden", "true");
	};

	wrapper.addEventListener("mouseenter", showExpanded);
	wrapper.addEventListener("mouseleave", hideExpanded);
	wrapper.addEventListener("focusin", showExpanded);
	wrapper.addEventListener("focusout", hideExpanded);

	expanded.backdrop.addEventListener("click", hideExpanded);
	expanded.panel.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			hideExpanded(event);
			wrapper.focus({ preventScroll: true });
		}
	});

	wrapper.append(summary, expanded.root);
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
