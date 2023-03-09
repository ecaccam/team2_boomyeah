let toast_timeout = null;
let saving_timeout = null;

document.addEventListener("DOMContentLoaded", () => {
    if(ux("#add_page_tabs_btn").self()){
        initializeRedactor("#section_pages .tab_content");
    }

    ux("body")
        .on("submit", "#add_module_form", addNewModuleContent)
        .on("submit", "#add_module_tab_form", onAddModuleTab)
        .on("submit", "#remove_tab_form", onConfirmRemoveTab)
        .on("submit", ".update_module_tab_form", onUpdateModuleTab)
        .on("click", ".section_page_tabs .add_page_btn", addNewTab);
});
    
function saveTabChanges(section_page_tab){
    clearTimeout(saving_timeout);
    M.Toast.dismissAll();
    
    saving_timeout = setTimeout(() => {        
        clearTimeout(toast_timeout);
        section_page_tab.find(".saving_indicator").addClass("show");
    
        toast_timeout = setTimeout(() => {
            section_page_tab.find(".saving_indicator").removeClass("show");
            M.toast({
                html: "Changes Saved",
                displayLength: 2800,
            });
            
        }, 800);
    }, 480);
}

function addNewModuleContent(event){
    event.preventDefault();
    let section_pages = ux("#section_pages");
    
    let post_form = ux(event.target);
    
    ux().post(post_form.attr("action"), post_form.serialize(), (response_data) => {
        if(response_data.status){
            let module_id = `#module_${ response_data.result.module_id }`;
            section_pages.append(response_data.result.html);
            addAnimation(module_id, "animate__fadeIn animate__slower");
            
            setTimeout(() => {
                initializeRedactor(`${ module_id } .section_page_tab .tab_content`);
            });

            /* Scroll to bottom */
            window.scrollTo(0, document.body.scrollHeight);
        }
    }, "json");
    
    return false
}

function onAddModuleTab(event){
    event.preventDefault();
    let post_form = ux(event.target);
    
    ux().post(post_form.attr("action"), post_form.serialize(), (response_data) => {
        if(response_data.status){
            let module_id = `#module_${ response_data.result.module_id }`;
            let module_tab_id = `.module_tab_${ response_data.result.tab_id }`;
            let tab_id = `#tab_${ response_data.result.tab_id }`;
            let section_page_content = ux(module_id);
            let section_page_tabs = ux(module_id).find(".section_page_tabs");
            let add_page_tab = section_page_tabs.find(".add_page_tab");
            section_page_content.append(response_data.result.html_content);
            section_page_tabs.append(response_data.result.html_tab);

            /** Insert New tab */
            addAnimation(ux(module_tab_id).self(), "animate__zoomIn");
            section_page_tabs.self().append(add_page_tab.self());
            
            setTimeout(() => {
                /** Insert Add page tab btn at the end */
                initializeRedactor(`${tab_id} .tab_content`);
                
                /** Auto click new tab */
                ux(`${module_tab_id} a`).self().click();
            });
        }
    }, "json");
    
    return false
}

function addNewTab(event){
    event.preventDefault();
    let add_module_tab_form = ux("#add_module_tab_form");
    let module_id = ux(event.target).data("module_id");
    add_module_tab_form.find(".module_id").val(module_id);
    add_module_tab_form.trigger("submit");
}

function onUpdateModuleTab(event){
    event.stopImmediatePropagation();
    event.preventDefault();
    
    let post_form = ux(event.target);
    let section_page_tab = post_form.closest(".section_page_tab");
    clearTimeout(saving_timeout);
    M.Toast.dismissAll();
    
    saving_timeout = setTimeout(() => {        
        clearTimeout(toast_timeout);
        section_page_tab.find(".saving_indicator").addClass("show");

        ux().post(post_form.attr("action"), post_form.serialize(), (response_data) => {
            section_page_tab.find(".saving_indicator").removeClass("show");
            let toast_message = (response_data.status) ? "Changes Saved" : "Saving Failed";
            
            toast_timeout = setTimeout(() => {
                M.toast({
                    html: toast_message,
                    displayLength: 2800,
                });
            }, 800);
        }, "json");
    }, 480);
    
    
    return false;
}

function onConfirmRemoveTab(event){
    event.stopImmediatePropagation();
    event.preventDefault();
    
    let post_form = ux(event.target);
    
    ux().post(post_form.attr("action"), post_form.serialize(), (response_data) => {
        if(response_data.status){
        
            /** Do these after form submission */
            let tab_item = ux(`.page_tab_item[data-tab_id="tab_${response_data.result.tab_id}"]`);
            removeModuleTab(tab_item.self());
        }
    }, "json");
    
    return false;
}
    
function removeModuleTab(tab_item){
    let section_page_content = tab_item.closest(".section_page_content");
    let section_page_tabs = tab_item.closest(".section_page_tabs");
    let tab_id = ux(tab_item).data("tab_id");
    let module_id = ux(tab_item).data("module_id");
    let is_active = ux(tab_item).self().classList.contains("active");
    addAnimation(tab_item, "animate__fadeOut");
    addAnimation(ux(`#${tab_id}`).self(), "animate__fadeOut");

    setTimeout(() => {
        ux(`#${tab_id}`).self().remove();
        tab_item.remove();
        
        setTimeout(() => {
            if(ux(section_page_tabs).findAll(".page_tab_item").length === 0){
                section_page_content.remove();
            } else {
                if(is_active){
                    ux(section_page_tabs.querySelectorAll(".page_tab_item")[0]).find("a").self().click();
                }
            }
        });
    }, 148);
}
    
function initializeRedactor(selector){
    RedactorX(selector, {
        editor: {
            minHeight: '360px'
        }
    });

    if(typeof Sortable !== "undefined"){
        document.querySelectorAll(".section_page_tabs").forEach((section_tabs_list) => {
            Sortable.create(section_tabs_list, {
                filter: ".add_page_tab"
            });
        });
    }
}

function initializeSectionPageEvents(ux_target = null, callback = null){
    if(callback){
        callback();
    }
}