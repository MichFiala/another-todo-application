# ApiApi

All URIs are relative to *http://localhost:5263*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**tasksGet**](#tasksget) | **GET** /tasks | |
|[**tasksIdDelete**](#tasksiddelete) | **DELETE** /tasks/{id} | |
|[**tasksIdStatePut**](#tasksidstateput) | **PUT** /tasks/{id}/state | |
|[**tasksPost**](#taskspost) | **POST** /tasks | |
|[**tasksShufflePut**](#tasksshuffleput) | **PUT** /tasks/shuffle | |

# **tasksGet**
> Array<TodoTaskDtoRecord> tasksGet()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

const { status, data } = await apiInstance.tasksGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<TodoTaskDtoRecord>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksIdDelete**
> tasksIdDelete()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.tasksIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksIdStatePut**
> tasksIdStatePut()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; // (default to undefined)
let state: number; // (default to undefined)

const { status, data } = await apiInstance.tasksIdStatePut(
    id,
    state
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|
| **state** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksPost**
> tasksPost(todoTaskDto)


### Example

```typescript
import {
    ApiApi,
    Configuration,
    TodoTaskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let todoTaskDto: TodoTaskDto; //

const { status, data } = await apiInstance.tasksPost(
    todoTaskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **todoTaskDto** | **TodoTaskDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tasksShufflePut**
> tasksShufflePut()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

const { status, data } = await apiInstance.tasksShufflePut();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

