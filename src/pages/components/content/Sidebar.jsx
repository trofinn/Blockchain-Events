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
        <div className="Sidebar h-[100vh] w-[0vw] rounded">

        </div>
    )
}
export default Sidebar;