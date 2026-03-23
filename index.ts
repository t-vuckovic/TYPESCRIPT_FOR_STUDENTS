interface ObserverHandlers {
  next?: (value: HttpRequest) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

class Observer {
  isUnsubscribed: boolean;
  handlers: ObserverHandlers;
  _unsubscribe?: () => void;

  constructor(handlers: ObserverHandlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: HttpRequest): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: Error): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe(): void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

type Subscribe = (observer: Observer) => (() => void);

class Observable {
  _subscribe: Subscribe;

  constructor(subscribe: Subscribe) {
    this._subscribe = subscribe;
  }

  static from(values: HttpRequest[]): Observable {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: ObserverHandlers) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
}

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
};

enum HttpStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
};

type User = {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
};

type HttpRequest = {
  method: HttpMethod;
  host: string;
  path: string;
  body?: User;
  params: {
    id?: string,
  };
};

type HttpResponse = {
  status: HttpStatus;
};

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: [
    'user',
    'admin'
  ],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: HttpRequest[] = [
  {
    method: HttpMethod.POST,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HttpMethod.GET,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request: HttpRequest): HttpResponse => {
  // handling of request
  return {status: HttpStatus.OK};
};
const handleError = (error: Error): HttpResponse => {
  // handling of error
  return {status: HttpStatus.INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('complete');

const requests$: Observable = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
