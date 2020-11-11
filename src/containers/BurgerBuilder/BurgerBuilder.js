import React, {Component} from 'react';
import Auxi from '../../hoc/Auxi';

class BurgerBuilder extends Component {
    render () {
        return (
            <Auxi>
                <div>Burger</div>
                <div>Build Controls</div>
            </Auxi>
        );
    }
}

export default BurgerBuilder;