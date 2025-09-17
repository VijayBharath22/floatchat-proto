import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
import requests
import json
from datetime import datetime, timedelta

# Page config
st.set_page_config(
    page_title="🌊 FloatChat - AI Ocean Data Explorer",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #0077BE;
        text-align: center;
        margin-bottom: 2rem;
    }
    .insight-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    .anomaly-alert {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    .chat-container {
        background: #f8fdff;
        padding: 1rem;
        border-radius: 10px;
        border: 1px solid #e0e0e0;
    }
</style>
""", unsafe_allow_html=True)

class FloatChatApp:
    def __init__(self):
        self.api_base_url = "http://localhost:8000/api/v1"
        self.initialize_session_state()
    
    def initialize_session_state(self):
        """Initialize session state variables"""
        if "messages" not in st.session_state:
            st.session_state.messages = [
                {
                    "role": "assistant",
                    "content": "Hello! I'm FloatChat, your AI assistant for exploring ARGO ocean data. How can I help you discover insights about our oceans today? 🌊"
                }
            ]
        
        if "user_mode" not in st.session_state:
            st.session_state.user_mode = "scientist"
    
    def render_header(self):
        """Render main header and navigation"""
        st.markdown('<h1 class="main-header">🌊 FloatChat - AI Ocean Data Explorer</h1>', unsafe_allow_html=True)
        st.markdown("*Discover ocean insights through natural language conversations*")
        
        # Mode selector
        col1, col2, col3, col4, col5 = st.columns([1, 1, 1, 1, 1])
        
        with col2:
            if st.button("👨‍🔬 Scientist Mode", key="scientist_mode"):
                st.session_state.user_mode = "scientist"
        
        with col3:
            if st.button("🧑‍🎓 Student Mode", key="student_mode"):
                st.session_state.user_mode = "student"
        
        with col4:
            if st.button("🐟 Fisherman Mode", key="fisherman_mode"):
                st.session_state.user_mode = "fisherman"
        
        st.markdown(f"**Current Mode:** {st.session_state.user_mode.title()}")
    
    def render_sidebar(self):
        """Render sidebar with controls and insights"""
        with st.sidebar:
            st.header("🔍 Data Filters")
            
            # Date range
            date_range = st.date_input(
                "Date Range",
                value=[datetime(2023, 1, 1), datetime(2023, 12, 31)],
                max_value=datetime.now()
            )
            
            # Region selector
            region = st.selectbox(
                "Ocean Region",
                ["All Regions", "Indian Ocean", "Pacific Ocean", "Atlantic Ocean", "Southern Ocean"]
            )
            
            # Depth range
            depth_range = st.slider(
                "Depth Range (m)",
                min_value=0,
                max_value=6000,
                value=(0, 2000),
                step=100
            )
            
            st.divider()
            
            # AI Insights Panel
            st.header("🧠 AI Insights")
            self.render_insights_panel()
            
            st.divider()
            
            # Quick stats
            st.header("📊 Quick Stats")
            self.render_quick_stats()
    
    def render_insights_panel(self):
        """Render AI insights panel"""
        insights = [
            {
                "type": "anomaly",
                "title": "Unusual Salinity Spike",
                "description": "Arabian Sea salinity +0.3 PSU above normal",
                "severity": "medium"
            },
            {
                "type": "trend", 
                "title": "Ocean Warming Trend",
                "description": "Indian Ocean +0.2°C over 5 years",
                "severity": "low"
            },
            {
                "type": "prediction",
                "title": "Cyclone Risk Alert",
                "description": "High heat content near Lakshadweep",
                "severity": "high"
            }
        ]
        
        for insight in insights:
            if insight["severity"] == "high":
                st.markdown(f"""
                <div class="anomaly-alert">
                    <strong>⚠️ {insight['title']}</strong><br>
                    {insight['description']}
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="insight-card">
                    <strong>📊 {insight['title']}</strong><br>
                    {insight['description']}
                </div>
                """, unsafe_allow_html=True)
    
    def render_quick_stats(self):
        """Render quick statistics"""
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Total Profiles", "2,156", "+23")
            st.metric("Active Floats", "89", "+2")
        
        with col2:
            st.metric("Avg Temp", "26.5°C", "+0.3°C")
            st.metric("Avg Salinity", "34.8 PSU", "-0.1 PSU")
    
    def render_main_view(self):
        """Render main content area"""
        tab1, tab2, tab3 = st.tabs(["🌍 Global View", "💬 Chat Interface", "📊 Data Analysis"])
        
        with tab1:
            self.render_global_view()
        
        with tab2:
            self.render_chat_interface()
        
        with tab3:
            self.render_data_analysis()
    
    def render_global_view(self):
        """Render global map view"""
        st.subheader("🗺️ Global ARGO Float Distribution")
        
        # Create sample data for map
        np.random.seed(42)
        n_floats = 100
        
        # Focus on Indian Ocean
        lats = np.random.normal(10, 15, n_floats)
        lons = np.random.normal(75, 20, n_floats)
        
        # Clip to reasonable bounds
        lats = np.clip(lats, -60, 60)
        lons = np.clip(lons, 30, 120)
        
        # Generate sample data
        temps = np.random.normal(26, 3, n_floats)
        salinities = np.random.normal(34.8, 0.5, n_floats)
        depths = np.random.uniform(500, 2000, n_floats)
        
        df = pd.DataFrame({
            'latitude': lats,
            'longitude': lons,
            'temperature': temps,
            'salinity': salinities,
            'max_depth': depths,
            'platform_number': [f"290{i:04d}" for i in range(n_floats)]
        })
        
        # Create interactive map
        fig = px.scatter_mapbox(
            df,
            lat='latitude',
            lon='longitude',
            color='temperature',
            size='max_depth',
            hover_name='platform_number',
            hover_data={
                'temperature': ':.1f',
                'salinity': ':.2f',
                'max_depth': ':.0f'
            },
            color_continuous_scale='Viridis',
            size_max=15,
            zoom=3,
            title="ARGO Floats - Colored by Surface Temperature"
        )
        
        fig.update_layout(
            mapbox_style="open-street-map",
            height=600,
            margin={"r":0,"t":50,"l":0,"b":0}
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Statistics below map
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Floats", len(df))
        with col2:
            st.metric("Avg Temperature", f"{df['temperature'].mean():.1f}°C")
        with col3:
            st.metric("Avg Salinity", f"{df['salinity'].mean():.2f} PSU")
        with col4:
            st.metric("Avg Depth", f"{df['max_depth'].mean():.0f}m")
    
    def render_chat_interface(self):
        """Render chat interface"""
        st.subheader("💬 Ask FloatChat")
        
        # Example queries
        with st.expander("💡 Try these example queries"):
            examples = [
                "Show me temperature profiles near Chennai",
                "What's the salinity in Arabian Sea last month?",
                "Compare oxygen levels during monsoon seasons",
                "Find ARGO floats near 15°N, 75°E",
                "How has Bay of Bengal temperature changed?"
            ]
            
            for example in examples:
                if st.button(example, key=f"example_{hash(example)}"):
                    self.process_chat_message(example)
        
        # Chat history
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)
        
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
                
                if "visualization" in message:
                    st.plotly_chart(message["visualization"])
                
                if "data" in message:
                    st.dataframe(message["data"])
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Chat input
        if prompt := st.chat_input("Ask me about ocean data..."):
            self.process_chat_message(prompt)
    
    def process_chat_message(self, message: str):
        """Process chat message and generate response"""
        # Add user message
        st.session_state.messages.append({
            "role": "user",
            "content": message
        })
        
        # Generate mock response based on keywords
        response_text, visualization, data = self.generate_mock_response(message)
        
        # Add assistant response
        assistant_message = {
            "role": "assistant",
            "content": response_text
        }
        
        if visualization:
            assistant_message["visualization"] = visualization
        
        if data is not None:
            assistant_message["data"] = data
        
        st.session_state.messages.append(assistant_message)
        
        # Rerun to update chat
        st.rerun()
    
    def generate_mock_response(self, query: str):
        """Generate mock response based on query keywords"""
        query_lower = query.lower()
        
        # Temperature query
        if 'temperature' in query_lower or 'temp' in query_lower:
            # Generate sample temperature profile
            depths = np.linspace(0, 2000, 50)
            temps = 28 * np.exp(-depths/1000) + 2 + np.random.normal(0, 0.5, len(depths))
            
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=temps, y=depths,
                mode='lines+markers',
                name='Temperature Profile',
                line=dict(color='red', width=3)
            ))
            
            fig.update_layout(
                title='Temperature Profile',
                xaxis_title='Temperature (°C)',
                yaxis_title='Depth (m)',
                yaxis=dict(autorange='reversed'),
                height=400
            )
            
            response = f"I found temperature profile data for your query. The surface temperature is {temps[0]:.1f}°C, decreasing with depth to {temps[-1]:.1f}°C at 2000m."
            
            return response, fig, None
        
        # Salinity query
        elif 'salinity' in query_lower or 'salt' in query_lower:
            # Generate sample salinity profile
            depths = np.linspace(0, 2000, 50)
            salinity = 34.5 + 0.5 * (depths/1000) + np.random.normal(0, 0.1, len(depths))
            
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=salinity, y=depths,
                mode='lines+markers',
                name='Salinity Profile',
                line=dict(color='blue', width=3)
            ))
            
            fig.update_layout(
                title='Salinity Profile',
                xaxis_title='Salinity (PSU)',
                yaxis_title='Depth (m)',
                yaxis=dict(autorange='reversed'),
                height=400
            )
            
            response = f"Here's the salinity profile data. Surface salinity is {salinity[0]:.2f} PSU, increasing with depth to {salinity[-1]:.2f} PSU."
            
            return response, fig, None
        
        # Location query
        elif any(word in query_lower for word in ['near', 'location', 'float', 'find']):
            # Generate sample nearby floats data
            data = pd.DataFrame({
                'Platform Number': ['2900123', '2900124', '2900125'],
                'Latitude': [15.2, 15.8, 14.9],
                'Longitude': [75.1, 74.8, 75.3],
                'Distance (km)': [12.5, 28.3, 18.7],
                'Last Profile': ['2023-08-15', '2023-08-14', '2023-08-16']
            })
            
            response = f"I found {len(data)} ARGO floats near your specified location. The closest float is {data.iloc[0]['Platform Number']} at {data.iloc[0]['Distance (km)']} km away."
            
            return response, None, data
        
        # Default response
        else:
            response = f"I understand you're asking about: '{query}'. Let me analyze the ARGO data to provide you with relevant information. This is a demo response showing how FloatChat would process your query using AI and provide ocean data insights."
            
            return response, None, None
    
    def render_data_analysis(self):
        """Render data analysis section"""
        st.subheader("📊 Advanced Data Analysis")
        
        analysis_type = st.selectbox(
            "Select Analysis Type",
            ["Profile Comparison", "Time Series Analysis", "Regional Statistics", "Anomaly Detection"]
        )
        
        if analysis_type == "Profile Comparison":
            self.render_profile_comparison()
        elif analysis_type == "Time Series Analysis":
            self.render_time_series_analysis()
        elif analysis_type == "Regional Statistics":
            self.render_regional_statistics()
        elif analysis_type == "Anomaly Detection":
            self.render_anomaly_detection()
    
    def render_profile_comparison(self):
        """Render profile comparison visualization"""
        st.write("Compare temperature and salinity profiles from different floats or regions")
        
        # Generate sample profile data
        depths = np.linspace(0, 2000, 50)
        
        # Profile 1 - Arabian Sea
        temp1 = 28 * np.exp(-depths/800) + 3 + np.random.normal(0, 0.3, len(depths))
        sal1 = 35.2 + 0.3 * (depths/1000) + np.random.normal(0, 0.05, len(depths))
        
        # Profile 2 - Bay of Bengal
        temp2 = 29 * np.exp(-depths/900) + 2.5 + np.random.normal(0, 0.3, len(depths))
        sal2 = 34.0 + 0.8 * (depths/1000) + np.random.normal(0, 0.05, len(depths))
        
        # Create comparison plot
        fig = make_subplots(
            rows=1, cols=2,
            subplot_titles=("Temperature Comparison", "Salinity Comparison"),
            shared_yaxes=True
        )
        
        # Temperature profiles
        fig.add_trace(
            go.Scatter(x=temp1, y=depths, name="Arabian Sea", line=dict(color='red')),
            row=1, col=1
        )
        fig.add_trace(
            go.Scatter(x=temp2, y=depths, name="Bay of Bengal", line=dict(color='orange')),
            row=1, col=1
        )
        
        # Salinity profiles
        fig.add_trace(
            go.Scatter(x=sal1, y=depths, name="Arabian Sea", line=dict(color='blue'), showlegend=False),
            row=1, col=2
        )
        fig.add_trace(
            go.Scatter(x=sal2, y=depths, name="Bay of Bengal", line=dict(color='cyan'), showlegend=False),
            row=1, col=2
        )
        
        fig.update_yaxes(autorange="reversed", title="Depth (m)")
        fig.update_xaxes(title="Temperature (°C)", row=1, col=1)
        fig.update_xaxes(title="Salinity (PSU)", row=1, col=2)
        fig.update_layout(height=500)
        
        st.plotly_chart(fig, use_container_width=True)
    
    def render_time_series_analysis(self):
        """Render time series analysis"""
        st.write("Analyze temporal trends in ocean parameters")
        
        # Generate sample time series data
        dates = pd.date_range('2020-01-01', '2023-12-31', freq='M')
        surface_temp = 26 + 2 * np.sin(2 * np.pi * np.arange(len(dates)) / 12) + np.random.normal(0, 0.5, len(dates))
        surface_sal = 34.5 + 0.3 * np.sin(2 * np.pi * np.arange(len(dates)) / 12 + np.pi/4) + np.random.normal(0, 0.1, len(dates))
        
        df_ts = pd.DataFrame({
            'Date': dates,
            'Surface_Temperature': surface_temp,
            'Surface_Salinity': surface_sal
        })
        
        # Create time series plot
        fig = make_subplots(
            rows=2, cols=1,
            subplot_titles=("Surface Temperature Trend", "Surface Salinity Trend"),
            shared_xaxes=True
        )
        
        fig.add_trace(
            go.Scatter(x=df_ts['Date'], y=df_ts['Surface_Temperature'], 
                      mode='lines+markers', name='Temperature', line=dict(color='red')),
            row=1, col=1
        )
        
        fig.add_trace(
            go.Scatter(x=df_ts['Date'], y=df_ts['Surface_Salinity'], 
                      mode='lines+markers', name='Salinity', line=dict(color='blue')),
            row=2, col=1
        )
        
        fig.update_yaxes(title="Temperature (°C)", row=1, col=1)
        fig.update_yaxes(title="Salinity (PSU)", row=2, col=1)
        fig.update_xaxes(title="Date", row=2, col=1)
        fig.update_layout(height=600)
        
        st.plotly_chart(fig, use_container_width=True)
    
    def render_regional_statistics(self):
        """Render regional statistics"""
        st.write("Compare statistics across different ocean regions")
        
        # Sample regional data
        regions = ['Arabian Sea', 'Bay of Bengal', 'South Indian Ocean', 'Equatorial Indian Ocean']
        avg_temp = [27.5, 28.2, 22.1, 27.8]
        avg_sal = [35.8, 33.2, 34.9, 34.5]
        profile_count = [245, 312, 189, 278]
        
        df_regional = pd.DataFrame({
            'Region': regions,
            'Avg_Temperature': avg_temp,
            'Avg_Salinity': avg_sal,
            'Profile_Count': profile_count
        })
        
        # Create regional comparison
        fig = make_subplots(
            rows=1, cols=3,
            subplot_titles=("Average Temperature", "Average Salinity", "Profile Count")
        )
        
        fig.add_trace(
            go.Bar(x=df_regional['Region'], y=df_regional['Avg_Temperature'], 
                   name='Temperature', marker_color='red'),
            row=1, col=1
        )
        
        fig.add_trace(
            go.Bar(x=df_regional['Region'], y=df_regional['Avg_Salinity'], 
                   name='Salinity', marker_color='blue'),
            row=1, col=2
        )
        
        fig.add_trace(
            go.Bar(x=df_regional['Region'], y=df_regional['Profile_Count'], 
                   name='Count', marker_color='green'),
            row=1, col=3
        )
        
        fig.update_yaxes(title="Temperature (°C)", row=1, col=1)
        fig.update_yaxes(title="Salinity (PSU)", row=1, col=2)
        fig.update_yaxes(title="Profile Count", row=1, col=3)
        fig.update_layout(height=400, showlegend=False)
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Display data table
        st.subheader("Regional Statistics Table")
        st.dataframe(df_regional, use_container_width=True)
    
    def render_anomaly_detection(self):
        """Render anomaly detection visualization"""
        st.write("Detect and visualize oceanographic anomalies")
        
        # Generate sample anomaly data
        np.random.seed(42)
        dates = pd.date_range('2023-01-01', '2023-12-31', freq='D')
        normal_temp = 26 + 2 * np.sin(2 * np.pi * np.arange(len(dates)) / 365) + np.random.normal(0, 0.3, len(dates))
        
        # Add some anomalies
        anomaly_indices = np.random.choice(len(dates), 20, replace=False)
        normal_temp[anomaly_indices] += np.random.normal(0, 2, len(anomaly_indices))
        
        # Detect anomalies (simple threshold method)
        mean_temp = np.mean(normal_temp)
        std_temp = np.std(normal_temp)
        threshold = 2 * std_temp
        
        anomalies = np.abs(normal_temp - mean_temp) > threshold
        
        # Create anomaly plot
        fig = go.Figure()
        
        # Normal data
        fig.add_trace(go.Scatter(
            x=dates[~anomalies], 
            y=normal_temp[~anomalies],
            mode='markers',
            name='Normal',
            marker=dict(color='blue', size=4)
        ))
        
        # Anomalies
        fig.add_trace(go.Scatter(
            x=dates[anomalies], 
            y=normal_temp[anomalies],
            mode='markers',
            name='Anomalies',
            marker=dict(color='red', size=8, symbol='star')
        ))
        
        # Add threshold lines
        fig.add_hline(y=mean_temp + threshold, line_dash="dash", line_color="red", 
                     annotation_text="Upper Threshold")
        fig.add_hline(y=mean_temp - threshold, line_dash="dash", line_color="red", 
                     annotation_text="Lower Threshold")
        
        fig.update_layout(
            title="Temperature Anomaly Detection - Indian Ocean 2023",
            xaxis_title="Date",
            yaxis_title="Temperature (°C)",
            height=500
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Anomaly summary
        st.subheader("Anomaly Summary")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Anomalies", np.sum(anomalies))
        with col2:
            st.metric("Anomaly Rate", f"{100*np.sum(anomalies)/len(dates):.1f}%")
        with col3:
            st.metric("Max Deviation", f"{np.max(np.abs(normal_temp - mean_temp)):.1f}°C")
    
    def run(self):
        """Main application entry point"""
        self.render_header()
        self.render_sidebar()
        self.render_main_view()

# Run the application
if __name__ == "__main__":
    app = FloatChatApp()
    app.run()



