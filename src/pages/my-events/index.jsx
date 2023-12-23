import React, {useEffect} from "react";
import {toast} from "react-hot-toast";
import EventCard from "../../pages/components/content/EventCard.jsx";
import {blockChainFactoryContract} from '../../helper/blockchain.js';
import {GetAllEvents} from "../../api-calls/events.js";

function MyEvents({data} ) {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isMetaMaskConnected, setIsMetaMaskConnected] = React.useState(false);

    const getMyEvents = async () => {
        if (isMetaMaskConnected) {
            try {
                const eventsResponse = await blockChainFactoryContract.getUserCreatedEvents(data);
                const response = await GetAllEvents(eventsResponse);
                setEvents(response.data);
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
        if(!data) {
            setLoading(true);
        }
        else {
            setLoading(false);
        }
        getMyEvents();
    }, [data]);


    return (
        <>
            <div className="w-full rounded m-1 " id="content">
                        <h1 className="ml-6" id="homeTitle"><i>My Events</i></h1>
                {loading ? (
                    <p>
                        Loading..
                    </p>
                ) : (

                    <div className="flex flex-wrap eventList justify-between">
                        {events.map((event) => {
                            // eslint-disable-next-line react/jsx-key
                            const myEvent = {
                                name: event.name,
                                city: event.city,
                                hour: event.hour,
                                address: event.address,
                                date: event.date,
                                photo: event.photo,
                                description: event.description,
                                blockAddress: event.blockAddress,
                                price: event.price,
                                reputationRequired: event.reputationRequired
                            }
                            // eslint-disable-next-line react/jsx-key
                            return <EventCard event={myEvent} admin={true}/>
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

export default MyEvents;