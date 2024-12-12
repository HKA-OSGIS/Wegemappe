Wegemappe provides user with optmized gas station location and route recommendations. 

It uses Leaflet, OSRM, GeoServer and POSTGIS. It works in the following way:

┌──────────┐          ┌───────────┐    data     ┌───────────────────┐    
│          │  routing │           │  requests   │     GeoServer     │    
│   OSRM   │◄─────────┤  Leaflet  ├────────────►│                   │    
│          │          │           │             │  Wegemappe Server │    
└──────────┘          └───────────┘             └────────┬──────────┘    
                                                         │               
                                                         │access database
                                                         │               
                                                   ┌─────▼─────┐         
                                                   │           │         
                                                   │  POSTGIS  │         
                                                   │           │         
                                                   └───────────┘         
