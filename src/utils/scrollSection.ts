interface ScrollSectionOptions {
    mobileBreakpoint?: number;
    desktopBlock?: ScrollLogicalPosition;
    mobileBlock?: ScrollLogicalPosition;
    blockOverrides?: Partial<Record<string, ScrollLogicalPosition>>;
    urlBasePath?: string;
}

export const scrollSection = (sectionId: string, options: ScrollSectionOptions = {}) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    const section = document.getElementById(sectionId);
    if (!section) return false;

    const {
        mobileBreakpoint = 768,
        desktopBlock = 'center',
        mobileBlock = 'start',
        blockOverrides = { projects: 'start' },
        urlBasePath = '/',
    } = options;

    const isMobileViewport = window.innerWidth <= mobileBreakpoint;
    const block = blockOverrides[sectionId] ?? (isMobileViewport ? mobileBlock : desktopBlock);

    section.scrollIntoView({ behavior: 'smooth', block });
    window.history.replaceState(null, '', `${urlBasePath}#${sectionId}`);

    return true;
};
