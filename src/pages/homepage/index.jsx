
import EventCard from "../../pages/components/content/EventCard.jsx";
import React, {useEffect} from "react";
import {toast} from "react-hot-toast";
import {blockChainContract, signer} from '../../helper/blockchain.js';
import { useDispatch } from 'react-redux';
import {GetAllEvents} from "../../api-calls/events.js";
import {SetAllEvents} from "../../redux/eventSlice.js";
function Homepage() {
    const [loading, setLoading] = React.useState(true);
    const [events, setEvents] = React.useState([]);
    const dispatch = useDispatch();
    const getMyEvents = async () => {
        try {
            const eventsResponse = await blockChainContract.getAllEvents();
            const eventIds = [];

            for (const event of eventsResponse) {
                eventIds.push(event.eventAddress);
            }
            const response = await GetAllEvents(eventIds);
            if(response.success) {
                dispatch(SetAllEvents(response.data));
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

    useEffect(() => {
        getMyEvents();
    }, []);


    return (
        <>
            <div className="w-full rounded m-1" id="content">
                <h1 className="ml-6" id="homeTitle"><i>Events in </i>Paris</h1>
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
                                city: "Paris",
                                hour: "00:00",
                                address: event.eventAddress,
                                date: "31/12/2023",
                                photo: "Event photo",
                                description: "Event Description",
                                price: event.price.toString(),
                                reputationRequired: event.reputationRequired.toString()
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

export default Homepage;