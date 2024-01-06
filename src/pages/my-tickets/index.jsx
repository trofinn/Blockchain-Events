
import React, {useEffect} from "react";
import {toast} from "react-hot-toast";
import {blockChainFactoryContract} from '../../helper/blockchain.js';
import EventCard from "../../pages/components/content/EventCard.jsx";
import {GetAllEvents} from "../../api-calls/events.js";

function MyTickets({ data }) {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isMetaMaskConnected, setIsMetaMaskConnected] = React.useState(false);

    const getMyTickets = async () => {
        if (isMetaMaskConnected) {
            try {
                const eventsResponse = await blockChainFactoryContract.getAllEvents();
                const response = await GetAllEvents(eventsResponse);
                if(response.success) {
                    setEvents(response.data);
                }
                else {
                    console.log("error getting the events");
                }
            } catch (e) {
                toast.error(e);
            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        const checkMetaMaskConnection = async () => {
            // Check if MetaMask is installed and connected
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                setIsMetaMaskConnected(accounts.length > 0);
            } else {
                setIsMetaMaskConnected(false);
            }
        };

        checkMetaMaskConnection();
    }, []);

    useEffect(() => {

        getMyTickets();
    }, [data]);


    return (
        <>
            <div className="w-full rounded m-1" id="content">
                <h1 className="ml-6" id="homeTitle"><i>My Tickets</i></h1>
                {loading ? (
                    <p>
                        No events..
                    </p>
                ) : (

                    <div className="flex flex-wrap eventList justify-between">
                        {events.map((event) => {
                            // eslint-disable-next-line react/jsx-key
                            const myEvent = {
                                name: event.name,
                                city: event.city,
                                hourStart: event.hourStart,
                                address: event.address,
                                dateStart: event.dateStart,
                                photo: event.photo,
                                description: event.description,
                                blockAddress: event.blockAddress,
                                price: event.price,
                                reputationRequired: event.reputationRequired
                            }
                            // eslint-disable-next-line react/jsx-key
                            return <EventCard event={myEvent}/>
                        })}
                    </div>
                )}
            </div>
        </>
    )
}

export default MyTickets