export const PG_BASE_PATH = "/pg";

export const PG_BRAND = {
    name: "Jay Ambe PG",
    shortName: "JA",
    tagline: "Co-Living & Library Management",
    address: "Paying Guest Admin Panel",
};

export const pgPath = (path = "") => {
    if (!path || path === "/") return PG_BASE_PATH;
    return `${PG_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
};
