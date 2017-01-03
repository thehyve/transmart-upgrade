var spec = {
    "swagger": "2.0",
    "schemes": [
        "http",
        "https"
    ],
    "consumes": [
        "application/json"
    ],
    "produces": [
        "application/json"
    ],
    "info": {
        "version": "17.1.0",
        "title": "Transmart"
    },
    "securityDefinitions": {
        "oauth": {
            "type": "oauth2",
            "flow": "implicit",
            "authorizationUrl": "/oauth/authorize?response_type=token&client_id={client_id}&redirect_uri={redirect}",
            "scopes": {
                "basic": "to be able to interact with transmart REST-API\n"
            }
        }
    },
    "security": [
        {
            "oauth": [
                "basic"
            ]
        }
    ],
    "paths": {
        "/v1/studies": {
            "get": {
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "$ref": "#/definitions/StudyResponse"
                        }
                    }
                }
            }
        },
        "/v1/studies/{studyid}": {
            "get": {
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "title": "StudiesResponse",
                            "type": "object",
                            "items": {
                                "title": "StudyArray",
                                "type": "array",
                                "items": {
                                    "title": "study",
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "single": {
                                            "type": "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "studyid",
                        "in": "path",
                        "description": "username to fetch",
                        "required": true,
                        "type": "string"
                    }
                ]
            }
        },
        "/v1/studies/{studyid}/concepts": {
            "get": {
                "parameters": [
                    {
                        "name": "studyid",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    }
                ],
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "title": "ConceptsResponse",
                            "type": "object",
                            "items": {
                                "title": "ConceptArray",
                                "type": "array",
                                "items": {
                                    "title": "study",
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "single": {
                                            "type": "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/studies/{studyid}/concepts/{conceptPath}": {
            "get": {
                "parameters": [
                    {
                        "name": "studyid",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "conceptPath",
                        "in": "path",
                        "description": "Concept path for which info will be fetched",
                        "required": true,
                        "type": "string"
                    }
                ],
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "title": "ConceptsResponse",
                            "type": "object",
                            "items": {
                                "title": "ConceptArray",
                                "type": "array",
                                "items": {
                                    "title": "study",
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "single": {
                                            "type": "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/studies/{studyid}/subjects": {
            "get": {
                "parameters": [
                    {
                        "name": "studyid",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    }
                ],
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "title": "ConceptsResponse",
                            "type": "object",
                            "items": {
                                "title": "ConceptArray",
                                "type": "array",
                                "items": {
                                    "title": "study",
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "single": {
                                            "type": "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/studies/{studyid}/subjects/{subjectid}": {
            "get": {
                "parameters": [
                    {
                        "name": "studyid",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "subjectid",
                        "in": "path",
                        "description": "Subject ID of the subject which will be fetched",
                        "required": true,
                        "type": "string"
                    }
                ],
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "title": "ConceptsResponse",
                            "type": "object",
                            "items": {
                                "title": "ConceptArray",
                                "type": "array",
                                "items": {
                                    "title": "study",
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "single": {
                                            "type": "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/studies/{studyid}/concepts/{conceptPath}/subjects": {
            "get": {
                "parameters": [
                    {
                        "name": "studyid",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "conceptPath",
                        "in": "path",
                        "description": "Concept path for which info will be fetched",
                        "required": true,
                        "type": "string"
                    }
                ],
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "title": "ConceptsResponse",
                            "type": "object",
                            "items": {
                                "title": "ConceptArray",
                                "type": "array",
                                "items": {
                                    "title": "study",
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "single": {
                                            "type": "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/studies/{studyid}/observations": {
            "get": {
                "parameters": [
                    {
                        "name": "studyid",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    }
                ],
                "description": "Gets all `Study` objects.\n",
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "title": "ConceptsResponse",
                            "type": "object",
                            "items": {
                                "title": "ConceptArray",
                                "type": "array",
                                "items": {
                                    "title": "study",
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "single": {
                                            "type": "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/observations": {
            "get": {
                "responses": {
                    "200": {
                        "description": "Successful response"
                    }
                }
            }
        },
        "/v1/studies/{studyId}/concepts/{conceptPath}/observations": {
            "get": {
                "parameters": [
                    {
                        "name": "studyId",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "conceptPath",
                        "in": "path",
                        "description": "Concept path",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful response"
                    }
                }
            }
        },
        "/v1/patient_sets/": {
            "post": {
                "parameters": [
                    {
                        "name": "i2b2query_xml",
                        "in": "query",
                        "description": "user to add to the system",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful response"
                    }
                }
            },
            "get": {
                "responses": {
                    "200": {
                        "description": "Successfull response"
                    }
                }
            }
        },
        "/v1/patient_sets/{resultInstanceId}": {
            "get": {
                "parameters": [
                    {
                        "name": "resultInstanceId",
                        "in": "path",
                        "description": "ID of the patient set, called resultInstance ID because internally it refers to the result of a query",
                        "required": true,
                        "type": "string"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successfull response"
                    }
                }
            }
        },
        "/v1/studies/{studyId}/concepts/{conceptPath}/highdim": {
            "get": {
                "parameters": [
                    {
                        "name": "studyId",
                        "in": "path",
                        "description": "Study ID of the study for which concepts will be fetched",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "conceptPath",
                        "in": "path",
                        "description": "Concept path",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "name": "dataType",
                        "in": "query",
                        "description": "Data Type constraint",
                        "required": false,
                        "type": "string"
                    },
                    {
                        "name": "projection",
                        "in": "query",
                        "description": "Projection applied to the HDD",
                        "required": false,
                        "type": "string"
                    },
                    {
                        "name": "assayConstraints",
                        "in": "query",
                        "description": "Assay Constraints",
                        "required": false,
                        "type": "string"
                    },
                    {
                        "name": "dataConstraints",
                        "in": "query",
                        "description": "Data constraint",
                        "required": false,
                        "type": "string"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful response"
                    }
                }
            }
        }
    },
    "definitions": {
        "StudyResponse": {
            "title": "StudiesResponse",
            "type": "object",
            "items": {
                "title": "StudyArray",
                "type": "array",
                "items": {
                    "title": "study",
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "string"
                        },
                        "accessibleByUser": {
                            "type": "object",
                            "properties": {
                                "view": {
                                    "type": "boolean"
                                },
                                "export": {
                                    "type": "boolean"
                                }
                            }
                        },
                        "_embedded": {
                            "type": "object",
                            "properties": {
                                "ontologyTerm": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "key": {
                                            "type": "string"
                                        },
                                        "fullName": {
                                            "type": "string"
                                        },
                                        "patientCount": {
                                            "type": "integer"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
