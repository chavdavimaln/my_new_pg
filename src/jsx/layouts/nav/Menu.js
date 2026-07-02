export const MenuList = [
    //Dashboard
    {
        title: 'Dashboard',	
        classsChange: 'mm-collapse',		
        iconStyle: <i className="flaticon-381-networking" />,
        content: [
            {
                title: 'Dashboard Light',
                to: 'dashboard',					
            },           
            {
                title: 'Dashboard Dark',
                to: 'index-2',					
            },           
            {
                title: 'Doctors',
                to: 'doctors',					
            },           
            {
                title: 'Doctors Details',
                to: 'doctors-details',
            },
            {
                title: 'Doctors Review',
                to: 'doctors-review',
            },
            {
                title: 'Patient Details',
                to: 'patient-details',
            },
              
        ],
    },
    
    //Apps
    {
        title: 'Apps',	
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-television" />,
        content: [
            {
                title: 'Profile',
                to: 'app-profile'
            },           
            {
                title: 'Edit Profile',
                to: 'edit-profile'
            },
            {
                title: 'Post Details',
                to: 'post-details'
            },
            {
                title: 'Email',                
                hasMenu : true,
                content: [
                    {
                        title: 'Compose',
                        to: 'email-compose',
                    },
                    {
                        title: 'Inbox',
                        to: 'email-inbox',
                    },
                    {
                        title: 'Read',
                        to: 'email-read',
                    }
                ],
            },
            {
                title:'Calendar',
                to: 'app-calender'
            },
            {
                title: 'Shop',
                //to: './',
                hasMenu : true,
                content: [
                    {
                        title: 'Product Grid',
                        to: 'ecom-product-grid',
                    },
                    {
                        title: 'Product List',
                        to: 'ecom-product-list',
                    },
                    {
                        title: 'Product Details',
                        to: 'ecom-product-detail',
                    },
                    {
                        title: 'Order',
                        to: 'ecom-product-order',
                    },
                    {
                        title: 'Checkout',
                        to: 'ecom-checkout',
                    },
                    {
                        title: 'Invoice',
                        to: 'ecom-invoice',
                    },
                    {
                        title: 'Customers',
                        to: 'ecom-customers',
                    },
                ],
            },
        ],
    },
    {
        title:'Flat Icons',
        to:'flat-icons',
        update : "NEW", 
        iconStyle : <i className="flaticon-381-file" />
    },
    //CMS
    {
        title : "CMS",
        classsChange: 'mm-collapse',
        update:"NEW",
        iconStyle: <i className="flaticon-381-database-1" />,
        content:[
            {
                title:'Content',
                to:'content'
            },
            {
                title:'Menus',
                to:'menu'
            },
            {
                title:'Email Template',
                to:'email-template'
            },
            {
                title:'Blog',
                to:'blog'
            },
        ],
    },
    //Charts
    {
        title: 'Charts',	
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-controls-3" />,
        content: [
            
            {
                title: 'RechartJs',
                to: 'chart-rechart',					
            },
            {
                title: 'Chartjs',
                to: 'chart-chartjs',					
            },
            {
                title: 'Sparkline',
                to: 'chart-sparkline',					
            },
            {
                title: 'Apexchart',
                to: 'chart-apexchart',					
            },
        ]
    },
    //Boosttrap
    {
        title: 'Bootstrap',	
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-internet" />,	
        content: [
            {
                title: 'Accordion',
                to: 'ui-accordion',					
            },
            {
                title: 'Alert',
                to: 'ui-alert',					
            },
            {
                title: 'Badge',
                to: 'ui-badge',					
            },
            {
                title: 'Button',
                to: 'ui-button',					
            },
            {
                title: 'Modal',
                to: 'ui-modal',					
            },
            {
                title: 'Button Group',
                to: 'ui-button-group',					
            },
            {
                title: 'List Group',
                to: 'ui-list-group',					
            },
            {
                title: 'Cards',
                to: 'ui-card',					
            },
            {
                title: 'Carousel',
                to: 'ui-carousel',					
            },
            {
                title: 'Dropdown',
                to: 'ui-dropdown',					
            },
            {
                title: 'Popover',
                to: 'ui-popover',					
            },
            {
                title: 'Progressbar',
                to: 'ui-progressbar',					
            },
            {
                title: 'Tab',
                to: 'ui-tab',					
            },
            {
                title: 'Typography',
                to: 'ui-typography',					
            },
            {
                title: 'Pagination',
                to: 'ui-pagination',					
            },
            {
                title: 'Grid',
                to: 'ui-grid',					
            },
        ]
    },
    //plugins
    {
        title:'Plugins',
        classsChange: 'mm-collapse',
        iconStyle : <i className="flaticon-381-heart"></i>,
        content : [
            {
                title:'Select 2',
                to: 'uc-select2',
            },            
            {
                title:'Sweet Alert',
                to: 'uc-sweetalert',
            },
            {
                title:'Toastr',
                to: 'uc-toastr',
            },
            // {
            //     title:'Jqv Map',
            //     to: 'map-jqvmap',
            // },
            {
                title:'Light Gallery',
                to: 'uc-lightgallery',
            },
        ]
    },
    //Widget
    {   
        title:'Widget',
        //classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-settings-2" />,
        to: 'widget-basic',
    },
    //Forms
    {
        title:'Forms',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-notepad" />,
        content : [
            {
                title:'Form Elements',
                to: 'form-element',
            },
            {
                title:'Wizard',
                to: 'form-wizard',
            },
            {
                title:'CkEditor',
                to: 'form-ckeditor',
            },
            {
                title:'Pickers',
                to: 'form-pickers',
            },
            {
                title:'Form Validate',
                to: 'form-validation',
            },

        ]
    },
    //Table
    {
        title:'Table',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-network"></i>,
        content : [
            {
                title:'Table Filtering',
                to: 'table-filtering',
            },
            {
                title:'Table Sorting',
                to: 'table-sorting',
            },
            {
                title:'Bootstrap',
                to: 'table-bootstrap-basic',
            },
            // {
            //     title:'Tables',
            //     to: 'table-datatable-basic',
            // },
           

        ]
    },
    //Pages
    {
        title:'Pages',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-layer-1"></i>,
        content : [
            {
                title:'Error',
                hasMenu : true,
                content : [
                    {
                        title: 'Error 400',
                        to : 'page-error-400',
                    },
                    {
                        title: 'Error 403',
                        to : 'page-error-403',
                    },
                    {
                        title: 'Error 404',
                        to : 'page-error-404',
                    },
                    {
                        title: 'Error 500',
                        to : 'page-error-500',
                    },
                    {
                        title: 'Error 503',
                        to : 'page-error-503',
                    },
                ],
            },
            {
                title:'Lock Screen',
                to: 'page-lock-screen',
            },

        ]
    },
    
]