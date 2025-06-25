import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import json
import plotly.figure_factory as ff
import plotly.express as px
import numpy as np

st.set_page_config(page_title="Exam Schedule Simulator", layout="wide")

def load_data():
    """Load the sample data from CSV files"""
    students_df = pd.read_csv('sample_students.csv')
    courses_df = pd.read_csv('sample_courses.csv')
    rooms_df = pd.read_csv('sample_rooms.csv')
    return students_df, courses_df, rooms_df

def get_course_conflicts(students_df):
    """Find which courses have common students"""
    conflicts = {}
    for course in students_df['course_code'].unique():
        conflicts[course] = []
        course_students = set(students_df[students_df['course_code'] == course]['student_id'])
        for other_course in students_df['course_code'].unique():
            if course != other_course:
                other_students = set(students_df[students_df['course_code'] == other_course]['student_id'])
                if course_students.intersection(other_students):
                    conflicts[course].append(other_course)
    return conflicts

def create_schedule(students_df, courses_df, rooms_df):
    """Create an exam schedule based on constraints"""
    dates = ['2025-07-10', '2025-07-11']
    sessions = ['Morning', 'Evening']
    
    # Initialize schedule
    schedule = {}
    for date in dates:
        schedule[date] = {'Morning': {'Room A': None}, 'Evening': {'Room A': None}}
    
    # Get course conflicts
    conflicts = get_course_conflicts(students_df)
    
    # Simple scheduling algorithm
    scheduled_courses = []
    courses = list(courses_df['course_code'])
    
    for course in courses:
        # Find first available slot
        for date in dates:
            for session in sessions:
                # Check if slot is empty and no conflicts
                if schedule[date][session]['Room A'] is None:
                    # Check if any conflicting course is scheduled in same day
                    conflict_found = False
                    for conflict_course in conflicts[course]:
                        for s in sessions:
                            if schedule[date][s]['Room A'] == conflict_course:
                                conflict_found = True
                                break
                    
                    if not conflict_found:
                        schedule[date][session]['Room A'] = course
                        scheduled_courses.append(course)
                        break
            if course in scheduled_courses:
                break
    
    return schedule

def create_gantt_chart(schedule):
    """Create a Gantt chart for the schedule"""
    tasks = []
    for date, sessions in schedule.items():
        for session, rooms in sessions.items():
            for room, course in rooms.items():
                if course:
                    # Convert session to hours
                    start_time = f"{date} 09:00:00" if session == "Morning" else f"{date} 14:00:00"
                    end_time = f"{date} 12:00:00" if session == "Morning" else f"{date} 17:00:00"
                    
                    tasks.append(dict(
                        Task=room,
                        Start=start_time,
                        Finish=end_time,
                        Resource=course
                    ))
    
    df = pd.DataFrame(tasks)
    fig = ff.create_gantt(df, colors={'PY106': 'rgb(46, 137, 205)',
                                     'AI101': 'rgb(114, 44, 121)',
                                     'DS105': 'rgb(198, 47, 105)'},
                         index_col='Resource',
                         show_colorbar=True,
                         group_tasks=True,
                         showgrid_x=True,
                         showgrid_y=True)
    
    return fig

def create_conflict_network(conflicts):
    """Create a network graph of course conflicts"""
    import networkx as nx
    
    G = nx.Graph()
    
    # Add nodes
    for course in conflicts.keys():
        G.add_node(course)
    
    # Add edges
    for course, conflict_list in conflicts.items():
        for conflict in conflict_list:
            G.add_edge(course, conflict)
    
    # Get positions
    pos = nx.spring_layout(G)
    
    # Create edge trace
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])
    
    # Create node trace
    node_x = []
    node_y = []
    node_text = []
    for node in G.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)
        node_text.append(node)
    
    return node_x, node_y, node_text, edge_x, edge_y

def main():
    st.title("📚 Exam Schedule Simulator")
    
    # Load data
    students_df, courses_df, rooms_df = load_data()
    
    # Sidebar
    st.sidebar.header("Dataset Information")
    st.sidebar.metric("Number of Students", len(students_df['student_id'].unique()))
    st.sidebar.metric("Number of Courses", len(courses_df))
    st.sidebar.metric("Number of Rooms", len(rooms_df))
    
    # Main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("Course Information")
        st.dataframe(courses_df)
        
        st.header("Student Enrollments")
        st.dataframe(students_df)
    
    with col2:
        st.header("Room Information")
        st.dataframe(rooms_df)
    
    # Create schedule
    schedule = create_schedule(students_df, courses_df, rooms_df)
    
    # Display schedule
    st.header("Generated Schedule")
    
    # Create tabs for different views
    tab1, tab2, tab3 = st.tabs(["Schedule View", "Gantt Chart", "Conflict Network"])
    
    with tab1:
        for date, sessions in schedule.items():
            st.subheader(f"Date: {date}")
            for session, rooms in sessions.items():
                for room, course in rooms.items():
                    if course:
                        course_info = courses_df[courses_df['course_code'] == course].iloc[0]
                        students = students_df[students_df['course_code'] == course]['student_id'].unique()
                        
                        st.markdown(f"""
                        **{session} - {room}**
                        - Course: {course} - {course_info['course_name']}
                        - Instructor: {course_info['instructor']}
                        - Students: {len(students)}
                        """)
                        
                        with st.expander("View enrolled students"):
                            st.write(", ".join(students))
    
    with tab2:
        st.plotly_chart(create_gantt_chart(schedule), use_container_width=True)
    
    with tab3:
        conflicts = get_course_conflicts(students_df)
        node_x, node_y, node_text, edge_x, edge_y = create_conflict_network(conflicts)
        
        import plotly.graph_objects as go
        
        # Create the figure
        fig = go.Figure()
        
        # Add edges
        fig.add_trace(go.Scatter(
            x=edge_x, y=edge_y,
            line=dict(width=0.5, color='#888'),
            hoverinfo='none',
            mode='lines'))
        
        # Add nodes
        fig.add_trace(go.Scatter(
            x=node_x, y=node_y,
            mode='markers+text',
            hoverinfo='text',
            text=node_text,
            textposition="bottom center",
            marker=dict(
                showscale=False,
                size=30,
                line_width=2)))
        
        fig.update_layout(
            title='Course Conflict Network',
            showlegend=False,
            hovermode='closest',
            margin=dict(b=0,l=0,r=0,t=40),
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False))
        
        st.plotly_chart(fig, use_container_width=True)

if __name__ == "__main__":
    main() 