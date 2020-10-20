import React from "react";


export class EventsManager {

    events_list = []

    addEvent(event) {
        this.events_list.push(event)
    }

}

export default class EventsComponent extends React.Component {

    static defaultProps = {
        events: []
    }

    render() {
        return (
            <div className={"eventList"}>

            </div>
        )
    }

}
