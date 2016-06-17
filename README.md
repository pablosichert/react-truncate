# React-Truncate
## Install
```
npm install react-truncate
```

## Usage
```js
import Truncate from 'react-truncate';

// ...

class Foo extends Component {
    render() {
        return (
            <Truncate lines={3} ellipsis={<span>... <a href='/link/to/article'>Read more</a></span>}>
                {longText}
            </Truncate>
        );
    }
}
```

## API
| Prop | Type | Default | Description | Example |
| ---- | ---- | ------- | ----------- | ------- |
| lines | integer, boolean {false} | 1 | Specifies how many lines of text should be preserved until it gets truncated. `false` and any integer < 1 will result in the text not getting clipped at all. | (`false`, `-1`, `0`), `1`, ...  |
| ellipsis | string, React node {single} | '…' | An ellipsis that is added to the end of the text in case it is truncated. | `'...'`, `<span>...</span>`, `<span>... <a href='#' onClick={someHandler}>Read more</a></span>`
| children | string, React node | - | The text to be truncated. Anything that can be evaluated as text. | `'Some text'`, `<p>Some paragraph <a/>with other text-based inline elements<a></p>`, `<span>Some</span><span>siblings</span>` |

## Known issues
- Text exceeding horizontal boundaries when "viewport" meta tag is not set accordingly for mobile devices (font boosting leads to wrong calculations). See [issue](https://github.com/One-com/react-truncate/issues/4#issuecomment-226703499)

## Integrated example for toggling "read more" text
```js
import React, { Component, PropTypes } from 'react';
import Truncate from 'react-truncate';

class ReadMore extends Component {
    constructor(...args) {
        super(...args);

        this.state = {};

        this.toggleLines = this.toggleLines.bind(this);
    }

    toggleLines(event) {
        event.preventDefault();

        this.setState({
            readMore: !this.state.readMore
        });
    }

    render() {
        let { children, text, lines } = this.props;

        return (
            <Truncate
                lines={this.state.readMore ? 0 : lines}
                ellipsis={(
                   <span>... <a href='#' onClick={this.toggleLines}>{text}</a></span>
                )}
            >
                {children}
            </Truncate>
        );
    }
}

ReadMore.defaultProps = {
    lines: 3,
    text: 'Read more'
};

ReadMore.propTypes = {
    children: PropTypes.node.isRequired,
    text: PropTypes.node,
    lines: PropTypes.number
};

export default ReadMore;
```
