import { SubscriptionClient as SubClient } from 'subscriptions-transport-ws';
import subscriptionResponseHandler, { subscriptionLoadingHandler } from './subscriptionResponseHandler';

export default class SubscriptionClient {
  constructor({
    url,
    errorHandler,
    shouldRetry = false,
    key,
    schemaName,
    onDataReceived = () => {},
  }) {
    this.url = url;
    this.errorHandler = errorHandler;
    this.subscriptionClient = null;
    this.shouldRetry = shouldRetry;
    this.schemaName = schemaName;
    this.key = key;
    this.onDataReceived = onDataReceived;
  }

  subscribe = (query, headers) => {
    const connectionParams = {
      ...headers,
    };

    this.subscriptionClient = new SubClient(this.url, {
      reconnect: this.shouldRetry,
      connectionParams,
    });

    const subscription = this.subscriptionClient.request({
      query,
    });

    subscription.subscribe({
      next: (data) => {
        subscriptionLoadingHandler({ schemaName: this.schemaName, key: this.key });
        const structuredResponse = subscriptionResponseHandler({
          response: data,
          schemaName: this.schemaName,
          key: this.key,
        });
        this.onDataReceived(structuredResponse);
      },
      error: (e) => {
        // eslint-disable-next-line no-throw-literal
        throw {
          status: this.errorHandler(e),
          ...e,
        };
      },
      complete: () => console.log('Closing Subscription Client'),
    });
  }

  unSubscribe = () => {
    if (this.subscriptionClient) {
      this.subscriptionClient.close();
    }
  }
}
