
import {Button} from "../../components/ui/button.jsx";
import {toast} from "react-hot-toast";
import {blockChainContract} from '../../helper/blockchain.js';

function EventPage() {
    const buyTicket = async () => {

        try {
            const transaction = await blockChainContract.mintTickets("0x36d599f7806b2DFC1A257e6a8ed3bB24A23E5643", 1);
            const receipt = await transaction.wait();
            const lockAddress = receipt.logs[0];
        } catch (e) {
            toast.error(e);
        }
    }
    /*
    const { id } = useParams();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        // Fetch event data based on the id parameter
        // Replace this with your actual data fetching logic
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/events/${id}`); // Adjust the API endpoint
                const data = await response.json();
                setEvent(data);
            } catch (error) {
                console.error('Error fetching event data:', error);
            }
        };

        fetchData();
    }, [id]);

     */
    const event = {
        name: "Event name",
        address: "0x36d599f7806b2DFC1A257e6a8ed3bB24A23E5643"

    };

    return (
        <>
            <div className="w-full rounded m-1" id="content">
                <h1 className="ml-6" id="homeTitle"><i>{event.name}</i></h1>
                <h2 className="ml-6">{event.address}</h2>
                <Button
                    onClick={buyTicket}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] bg-blue-800 border-0 text-white justify-center hover:bg-blue-900 hover:text-white"
                >
                    Buy Ticket
                </Button>
            </div>
        </>
    )
}

export default EventPage;