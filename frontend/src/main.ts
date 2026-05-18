import './style.css';

class DropdownManager {
    private static instance: DropdownManager;
    private dropdowns: Dropdown[] = [];

    static getInstance(): DropdownManager {
        if (!DropdownManager.instance) {
            DropdownManager.instance = new DropdownManager();
        }
        return DropdownManager.instance;
    }

    register(dropdown: Dropdown): void {
        this.dropdowns.push(dropdown);
    }

    closeAll(): void {
        this.dropdowns.forEach(dropdown => dropdown.close());
    }
}

class Dropdown {
    protected element: HTMLElement;
    protected button: HTMLButtonElement;
    protected content: HTMLElement;
    protected manager: DropdownManager;

    constructor(element: HTMLElement) {
        this.element = element;
        this.button = element.querySelector('.dropdown-btn') as HTMLButtonElement;
        this.content = element.querySelector('.dropdown-content') as HTMLElement;
        this.manager = DropdownManager.getInstance();
        
        this.init();
        this.manager.register(this);
    }

    protected init(): void {
        this.button?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
    }

    private toggle(): void {
        if (this.content.classList.contains('show')) {
            this.close();
        } else {
            this.manager.closeAll();
            this.open();
        }
    }

    open(): void {
        this.content.classList.add('show');
    }

    close(): void {
        this.content.classList.remove('show');
    }

    isOpen(): boolean {
        return this.content.classList.contains('show');
    }

    getContent(): HTMLElement {
        return this.content;
    }
}

class CheckboxDropdown extends Dropdown {
    constructor(element: HTMLElement) {
        super(element);
        this.preventCloseOnCheckboxClicks();
    }

    private preventCloseOnCheckboxClicks(): void {
        const checkboxes = this.content.querySelectorAll('input, label, .checkbox-item');
        checkboxes.forEach(el => {
            el.addEventListener('click', (e) => e.stopPropagation());
        });
    }
}

class DateDropdown extends Dropdown {
    private parent: HTMLElement;
    private exactDateInput: HTMLInputElement;
    private rangeDiv: HTMLElement;

    constructor(element: HTMLElement) {
        super(element);
        this.parent = this.element.closest('.date-filter') as HTMLElement;
        this.exactDateInput = this.parent.querySelector('.exact-date') as HTMLInputElement;
        this.rangeDiv = this.parent.querySelector('.range-dates') as HTMLElement;
        
        this.initDateOptions();
    }

    private initDateOptions(): void {
        const options = this.content.querySelectorAll('.date-option');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.getAttribute('data-value');
                this.button.textContent = opt.textContent;
                this.handleDateOption(value);
            });
        });
    }

    private handleDateOption(value: string | null): void {
        if (value === 'exact') {
            this.exactDateInput.style.display = 'block';
            this.rangeDiv.style.display = 'none';
        } else if (value === 'range') {
            this.exactDateInput.style.display = 'none';
            this.rangeDiv.style.display = 'flex';
        } else {
            this.exactDateInput.style.display = 'none';
            this.rangeDiv.style.display = 'none';
        }
    }
}

class ResponsibleFilter {
    private dropdown: CheckboxDropdown;
    private allCb: HTMLInputElement;
    private otherCbs: NodeListOf<HTMLInputElement>;
    private resetBtn: HTMLButtonElement;

    constructor(container: HTMLElement) {
        const dropdownElement = container.querySelector('.dropdown') as HTMLElement;
        this.dropdown = new CheckboxDropdown(dropdownElement);
        this.allCb = dropdownElement.querySelector('input[value="all"]') as HTMLInputElement;
        this.otherCbs = dropdownElement.querySelectorAll('input[value]:not([value="all"])');
        this.resetBtn = dropdownElement.querySelector('.reset-btn') as HTMLButtonElement;
        
        this.init();
    }

    private init(): void {
        this.allCb?.addEventListener('change', () => {
            this.otherCbs.forEach(cb => cb.checked = this.allCb.checked);
        });

        this.otherCbs.forEach(cb => {
            cb.addEventListener('change', () => {
                if (this.allCb.checked) this.allCb.checked = false;
            });
        });

        this.resetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.otherCbs.forEach(cb => cb.checked = false);
            if (this.allCb) this.allCb.checked = false;
        });
    }
}

class StatusFilter {
    private dropdown: CheckboxDropdown;
    private noDealsCb: HTMLInputElement;
    private otherCbs: NodeListOf<HTMLInputElement>;
    private resetBtn: HTMLButtonElement;

    constructor(container: HTMLElement) {
        const dropdownElement = container.querySelector('.dropdown') as HTMLElement;
        this.dropdown = new CheckboxDropdown(dropdownElement);
        this.noDealsCb = dropdownElement.querySelector('input[value="no_deals"]') as HTMLInputElement;
        this.otherCbs = dropdownElement.querySelectorAll('input[value]:not([value="no_deals"])');
        this.resetBtn = dropdownElement.querySelector('.reset-btn') as HTMLButtonElement;
        
        this.init();
    }

    private init(): void {
        this.noDealsCb?.addEventListener('change', () => {
            if (this.noDealsCb.checked) {
                this.otherCbs.forEach(cb => cb.checked = false);
            }
        });

        this.otherCbs.forEach(cb => {
            cb.addEventListener('change', () => {
                if (this.noDealsCb.checked) this.noDealsCb.checked = false;
            });
        });

        this.resetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.otherCbs.forEach(cb => cb.checked = false);
            if (this.noDealsCb) this.noDealsCb.checked = false;
        });
    }
}

class App {
    private manager: DropdownManager;

    constructor() {
        this.manager = DropdownManager.getInstance();
        this.init();
    }

    private init(): void {
        this.initDateDropdowns();
        this.initResponsibleFilter();
        this.initStatusFilter();
        this.initGlobalClickHandler();
        this.initDropdownButtons();
        this.initReportButton();
    }

    private initDateDropdowns(): void {
        const dateDropdowns = document.querySelectorAll('.date-filter .dropdown');
        dateDropdowns.forEach(dropdown => {
            new DateDropdown(dropdown as HTMLElement);
        });
    }

    private initResponsibleFilter(): void {
        const filterGroup = document.querySelector('.filter-group .dropdown')?.closest('.filter-group');
        if (filterGroup) {
            new ResponsibleFilter(filterGroup as HTMLElement);
        }
    }

    private initStatusFilter(): void {
        let statusContainer: HTMLElement | null = null;
        document.querySelectorAll('.filter-group').forEach(container => {
            if (container.querySelector('.dropdown') && container.querySelector('input[value="no_deals"]')) {
                statusContainer = container as HTMLElement;
            }
        });
        
        if (statusContainer) {
            new StatusFilter(statusContainer);
        }
    }

    private initGlobalClickHandler(): void {
        window.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const isInsideDropdownContent = target.closest('.dropdown-content');
            
            if (!isInsideDropdownContent) {
                this.manager.closeAll();
            }
        });
    }

    private initDropdownButtons(): void {
        document.querySelectorAll('.dropdown-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    private initReportButton(): void {
        const reportBtn = document.querySelector('.btn-primary') as HTMLButtonElement;
        const statusBlock = document.querySelector('.status-report') as HTMLElement;

        reportBtn?.addEventListener('click', () => {
            statusBlock.textContent = 'Ошибка формирования отчета';
        });
    }
}

new App();