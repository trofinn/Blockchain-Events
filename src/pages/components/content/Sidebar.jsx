import * as Icon from 'react-bootstrap-icons';

const SidebarData = [
    {
        title: "Home",
        icon: <Icon.House/>,
        link: "/"
    },
    {
        title: "My Tickets",
        icon: <Icon.TicketDetailed/>,
        link: "/tickets"
    },
    {
        title: "My Events",
        icon: <Icon.CalendarEvent/>,
        link: "/my-events"
    },
    {
        title: "Create Event",
        icon: <Icon.PlusSquare/>,
        link: "/create-event"
    }
]

function Sidebar() {
    return (
        <div className="Sidebar h-[100vh] w-[13vw] rounded m-1">
            <ul className="SidebarList">
                {SidebarData.map((val, key) => {
                    return (
                        <li key={key} className="row" onClick={() => {window.location.pathname = val.link}}>
                            <div id="icon">{val.icon}</div>
                            <div id="title">{val.title}</div>
                        </li>);
                })}
            </ul>
        </div>
    )
}
export default Sidebar;