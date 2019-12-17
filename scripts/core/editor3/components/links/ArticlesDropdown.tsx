import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";

class ArticlesDropdown extends Component {
    static propTypes = {
        suggestions: PropTypes.instanceOf(Array)
    };

    static defaultProps = {
        suggestions: []
    };

    constructor(props) {
        super(props);

        this.state = {
            //searched articles result
            articles: [],
            // The active selection's index
            activeSuggestion: 0,
            // The suggestions that match the user's input
            filteredSuggestions: [],
            // Whether or not the suggestion list is shown
            showSuggestions: false,
            // What the user has entered
            userInput: ""
        };
    }

    onChange = e => {
        const {suggestions} = this.props;
        const userInput = e.currentTarget.value;

        //search for the articles


        const searchResult = fetch('https://cms.sd.funkedigital.de/api/publish_queue?max_results=25&page=1&where={"$and":[{"$or":[{"headline":{"$regex":"' + userInput + '","$options":"-i"}},{"unique_name":"' + userInput + '"}]}]}', {
            method: "GET",
            headers: new Headers({
                'accept': 'application/json, text/plain, */*',
                'authorization': 'Basic Zjk0OTA4MTMtZTkyOS00MzM2LTgxM2MtMzRiZjlkYWE5N2Q1Og=='
            }),
        }).then((r) => {
            return r.json()
        });



        searchResult.then((result) => this.setState({articles: result._items}));




        // Filter our suggestions that don't contain the user's input
        const filteredSuggestions = this.state.articles.filter(
            article =>
                article.headline.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        ).filter((thing, index, self) => self.findIndex(t => t.headline === thing.headline) === index);


        this.setState({
            activeSuggestion: 0,
            filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value
        });
    };

    onClick = e => {
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: e.currentTarget.innerText
        });
    };

    onKeyDown = e => {
        const {activeSuggestion, filteredSuggestions} = this.state;

        // User pressed the enter key
        if (e.keyCode === 13) {
            this.setState({
                activeSuggestion: 0,
                showSuggestions: false,
                userInput: filteredSuggestions[activeSuggestion]
            });
        }
        // User pressed the up arrow
        else if (e.keyCode === 38) {
            if (activeSuggestion === 0) {
                return;
            }

            this.setState({activeSuggestion: activeSuggestion - 1});
        }
        // User pressed the down arrow
        else if (e.keyCode === 40) {
            if (activeSuggestion - 1 === filteredSuggestions.length) {
                return;
            }

            this.setState({activeSuggestion: activeSuggestion + 1});
        }
    };

    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: {
                activeSuggestion,
                filteredSuggestions,
                showSuggestions,
                userInput
            }
        } = this;

        let suggestionsListComponent;

        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <ul class="suggestions">
                        {filteredSuggestions.map((suggestion, index) => {
                            let className;

                            // Flag the active suggestion with a class
                            if (index === activeSuggestion) {
                                className = "suggestion-active";
                            }

                            return (
                                <li className={className} key={suggestion._id} onClick={onClick}>
                                    {suggestion.headline}
                                </li>
                            );
                        })}
                    </ul>
                );
            } else {
                suggestionsListComponent = (
                    <div class="no-suggestions">
                        <em>No suggestions, you're on your own!</em>
                    </div>
                );
            }
        }

        return (
            <Fragment>
                <input
                    type="text"
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    value={userInput}
                    placeholder="Start Searching..."
                />
                {suggestionsListComponent}
            </Fragment>
        );
    }
}

export default ArticlesDropdown;
