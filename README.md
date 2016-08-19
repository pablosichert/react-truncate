# React-Truncate
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Coverage status][coveralls-image]][coveralls-url]
[![Dependency status][david-dm-image]][david-dm-url]
[![Dev dependency status][david-dm-dev-image]][david-dm-dev-url]

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
| ellipsis | string, React node | '…' | An ellipsis that is added to the end of the text in case it is truncated. | `'...'`, `<span>...</span>`, `<span>... <a href='#' onClick={someHandler}>Read more</a></span>`, `[<span key='some'>Some</span>, <span key='siblings'>siblings<span>]`
| children | string, React node | | The text to be truncated. Anything that can be evaluated as text. | `'Some text'`, `<p>Some paragraph <a/>with other text-based inline elements<a></p>`, `<span>Some</span><span>siblings</span>` |

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
                lines={this.state.readMore && lines}
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

[npm-url]: https://npmjs.org/package/react-truncate
[downloads-image]: http://img.shields.io/npm/dm/react-truncate.svg
[npm-image]: https://badge.fury.io/js/react-truncate.svg
[travis-url]: https://travis-ci.org/One-com/react-truncate
[travis-image]: http://img.shields.io/travis/One-com/react-truncate.svg
[coveralls-url]:https://coveralls.io/r/One-com/react-truncate
[coveralls-image]:https://coveralls.io/repos/One-com/react-truncate/badge.png
[david-dm-url]:https://david-dm.org/One-com/react-truncate
[david-dm-image]:https://david-dm.org/One-com/react-truncate.svg
[david-dm-dev-url]:https://david-dm.org/One-com/react-truncate#info=devDependencies
[david-dm-dev-image]:https://david-dm.org/One-com/react-truncate/dev-status.svg
