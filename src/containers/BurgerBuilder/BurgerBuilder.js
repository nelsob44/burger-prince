import React, {Component} from 'react';
import Auxi from '../../hoc/Auxi/Auxi';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/Auxi/withErrorHandler/withErrorHandler';


const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {
    state = {
        ingredients: {
            salad: 0,
            bacon: 0,
            cheese: 0,
            meat: 0
        },
        totalPrice: 4,
        purchaseable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        console.log(this.props);
        axios.get('https://burger-prince-81505.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({ingredients: response.data})
            }).catch(error => {
                this.setState({error: true})
            });
    }

    updatePurchaseState (ingredients) {
        const sum = Object.keys(ingredients).map(igKey => {
            return ingredients[igKey] 
        }).reduce((sum, el) => {
            return sum + el;
        }, 0);
        this.setState({purchaseable: sum > 0})
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients})
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0) {
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceAddition;
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients})
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        // this.setState({loading: true});
        // const order = {
        //     ingredients: this.state.ingredients,
        //     price: this.state.totalPrice,
        //     customer: {
        //         name: 'Nelly Oba',
        //         address: {
        //             street: 'Carlsdale avenue',
        //             postcode: 'NE3 5TP',
        //             country: 'United Kingdom'
        //         },
        //         email: 'nelly@yahoo.com'
        //     },
        //     deliveryMethod: 'rapid'
        // }
        // axios.post('/orders.json', order)
        // .then(response => {
        //     this.setState({loading: false, purchasing: false});
        //     console.log(response);
        // })
        // .catch(error => {
        //     this.setState({loading: false, purchasing: false});
        //     console.log(error);
        // });
        const queryParams = [];
        for (let i in this.state.ingredients) {
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
        }
        queryParams.push('price=' + this.state.totalPrice);
        const queryString = queryParams.join('&');

        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryString
        });
    }
    render () {
        const disabledInfo = {
            ...this.state.ingredients
        };

        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <=0
        }
        let orderSummary = null;
        
        let burger = this.state.error ? <p>Ingredients can't be loaded</p> : <Spinner />

        if(this.state.ingredients) {
            burger = (
                <Auxi>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        purchaseable={this.state.purchaseable}
                        ordered={this.purchaseHandler}
                        price={this.state.totalPrice}/>
                </Auxi>
            );

            orderSummary = <OrderSummary ingredients={this.state.ingredients} 
                price={this.state.totalPrice.toFixed(2)}
                purchaseContinued={this.purchaseContinueHandler}
                purchaseCancelled={this.purchaseCancelHandler}/>;
        }

        if(this.state.loading) {
            orderSummary = <Spinner />;
        }

        return (
            <Auxi>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Auxi>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);