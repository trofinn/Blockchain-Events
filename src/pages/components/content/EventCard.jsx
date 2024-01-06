import {Separator} from "../../../components/ui/separator.jsx";
import { Link } from 'react-router-dom';
import * as Icon from 'react-bootstrap-icons';
import moment from 'moment';
function EventCard({ event, admin }) {
    const eventPageUrl = `/events/${event.blockAddress}`;


    return (
        <a href={eventPageUrl} className="event-link">
            <div className="eventCard m-6 rounded">
                <div className="wrapper">
                    <div className="banner-image-event"></div>
                    <div>
                        <div className="space-y-1">
                            {admin ? (
                                <div className="flex justify-between" id="eventHeader">
                                    <h1 id="eventName" className="text-white">{event.name}</h1>
                                    <Icon.GearFill className="center-arrow"></Icon.GearFill>
                                </div>
                            ) : (
                                <div className="flex justify-between" id="eventHeader">
                                    <h1 id="eventName" className="text-white">{event.name}</h1>
                                </div>
                            )}

                            <p className="text-sm text-muted-foreground">
                                {event.city}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {event.address}
                            </p>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex h-5 items-center space-x-4 text-sm mb-2">
                            <div className="text-white">{moment(event.dateStart).format("DD / MM / YYYY")}</div>
                            <Separator orientation="vertical" />
                            <div className="text-white">{event.hourStart}</div>
                            <Separator orientation="vertical" />
                            <div className="text-white">Price: {event.price}</div>
                            <Separator orientation="vertical" />
                            <div className="text-white">Reputation: {event.reputationRequired}</div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
        );
}

export default EventCard;