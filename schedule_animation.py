import pygame
import pandas as pd
import sys
from datetime import datetime
import time

# Initialize Pygame
pygame.init()

# Constants
WINDOW_WIDTH = 1200
WINDOW_HEIGHT = 800
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
BLUE = (46, 137, 205)
PURPLE = (114, 44, 121)
PINK = (198, 47, 105)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# Course colors
COURSE_COLORS = {
    'PY106': BLUE,
    'AI101': PURPLE,
    'DS105': PINK
}

class ScheduleSimulation:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Exam Schedule Simulation")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 32)
        self.small_font = pygame.font.Font(None, 24)
        
        # Load data
        self.students_df = pd.read_csv('sample_students.csv')
        self.courses_df = pd.read_csv('sample_courses.csv')
        self.rooms_df = pd.read_csv('sample_rooms.csv')
        
        # Animation state
        self.current_step = 0
        self.animation_steps = []
        self.schedule = {}
        self.conflicts = self.get_course_conflicts()
        
        # Initialize schedule grid
        self.dates = ['2025-07-10', '2025-07-11']
        self.sessions = ['Morning', 'Evening']
        for date in self.dates:
            self.schedule[date] = {'Morning': {'Room A': None}, 'Evening': {'Room A': None}}
        
        # Create animation steps
        self.create_animation_steps()
        
    def get_course_conflicts(self):
        conflicts = {}
        for course in self.students_df['course_code'].unique():
            conflicts[course] = []
            course_students = set(self.students_df[self.students_df['course_code'] == course]['student_id'])
            for other_course in self.students_df['course_code'].unique():
                if course != other_course:
                    other_students = set(self.students_df[self.students_df['course_code'] == other_course]['student_id'])
                    if course_students.intersection(other_students):
                        conflicts[course].append(other_course)
        return conflicts
    
    def create_animation_steps(self):
        courses = list(self.courses_df['course_code'])
        scheduled_courses = []
        
        for course in courses:
            # Add step to show current course being processed
            self.animation_steps.append({
                'type': 'process_course',
                'course': course
            })
            
            # Check each slot
            for date in self.dates:
                for session in self.sessions:
                    if self.schedule[date][session]['Room A'] is None:
                        # Add step to check slot
                        self.animation_steps.append({
                            'type': 'check_slot',
                            'date': date,
                            'session': session,
                            'course': course
                        })
                        
                        # Check conflicts
                        conflict_found = False
                        for conflict_course in self.conflicts[course]:
                            for s in self.sessions:
                                if self.schedule[date][s]['Room A'] == conflict_course:
                                    conflict_found = True
                                    # Add conflict detection step
                                    self.animation_steps.append({
                                        'type': 'conflict_found',
                                        'course': course,
                                        'conflict_course': conflict_course,
                                        'date': date,
                                        'session': s
                                    })
                                    break
                            if conflict_found:
                                break
                        
                        if not conflict_found:
                            self.schedule[date][session]['Room A'] = course
                            scheduled_courses.append(course)
                            # Add scheduling step
                            self.animation_steps.append({
                                'type': 'schedule_course',
                                'course': course,
                                'date': date,
                                'session': session
                            })
                            break
                if course in scheduled_courses:
                    break
    
    def draw_schedule_grid(self):
        # Draw grid
        cell_width = 200
        cell_height = 100
        start_x = 300
        start_y = 200
        
        # Draw headers
        for i, date in enumerate(self.dates):
            text = self.font.render(date, True, BLACK)
            self.screen.blit(text, (start_x + i * cell_width * 2, start_y - 40))
        
        for i, session in enumerate(self.sessions):
            text = self.font.render(session, True, BLACK)
            self.screen.blit(text, (start_x - 120, start_y + i * cell_height))
        
        # Draw cells
        for i, date in enumerate(self.dates):
            for j, session in enumerate(self.sessions):
                x = start_x + i * cell_width * 2
                y = start_y + j * cell_height
                pygame.draw.rect(self.screen, BLACK, (x, y, cell_width, cell_height), 2)
                
                course = self.schedule[date][session]['Room A']
                if course:
                    pygame.draw.rect(self.screen, COURSE_COLORS[course], (x + 2, y + 2, cell_width - 4, cell_height - 4))
                    text = self.font.render(course, True, WHITE)
                    self.screen.blit(text, (x + 10, y + cell_height//3))
    
    def draw_current_step(self):
        if self.current_step >= len(self.animation_steps):
            return
        
        step = self.animation_steps[self.current_step]
        
        # Draw step description
        if step['type'] == 'process_course':
            text = f"Processing course: {step['course']}"
        elif step['type'] == 'check_slot':
            text = f"Checking slot: {step['date']} {step['session']} for {step['course']}"
        elif step['type'] == 'conflict_found':
            text = f"Conflict found: {step['course']} with {step['conflict_course']}"
        elif step['type'] == 'schedule_course':
            text = f"Scheduling {step['course']} on {step['date']} {step['session']}"
        
        text_surface = self.font.render(text, True, BLACK)
        self.screen.blit(text_surface, (50, 50))
    
    def run(self):
        running = True
        last_step_time = time.time()
        step_delay = 2  # seconds between steps
        
        while running:
            current_time = time.time()
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE:
                        self.current_step += 1
                    elif event.key == pygame.K_ESCAPE:
                        running = False
            
            # Auto advance steps
            if current_time - last_step_time >= step_delay:
                if self.current_step < len(self.animation_steps):
                    self.current_step += 1
                    last_step_time = current_time
            
            # Draw
            self.screen.fill(WHITE)
            self.draw_schedule_grid()
            self.draw_current_step()
            
            # Draw instructions
            instructions = [
                "Space: Next step",
                "Esc: Exit",
                f"Step: {self.current_step + 1}/{len(self.animation_steps)}"
            ]
            for i, instruction in enumerate(instructions):
                text = self.small_font.render(instruction, True, BLACK)
                self.screen.blit(text, (50, WINDOW_HEIGHT - 100 + i * 30))
            
            pygame.display.flip()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    simulation = ScheduleSimulation()
    simulation.run() 