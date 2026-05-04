<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Meeting;
use App\Models\ClassModel;
use App\Models\User;
use App\Models\Material;
use App\Models\Assignment;
use App\Http\Controllers\MeetingController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;

class MeetingUnitTest extends TestCase
{
    use RefreshDatabase;

    protected $meetingController;
    protected $user;
    protected $class;
    protected $meeting;

    protected function getEnvironmentSetUp($app)
    {
        $app['config']->set('database.default', 'mysql');
        $app['config']->set('database.connections.mysql.database', 'testing');
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->meetingController = new MeetingController();

        // Create test user
        $this->user = User::factory()->create(['role' => 'mentor']);

        // Create test class
        $this->class = ClassModel::factory()->create(['mentor_id' => $this->user->id]);

        // Create test meeting
        $this->meeting = Meeting::factory()->create(['class_id' => $this->class->id]);

        Auth::login($this->user);
    }

    /** @test */
    public function mentor_can_view_meetings_index()
    {
        Auth::login($this->user);

        $response = $this->meetingController->index($this->class->id);

        $this->assertInstanceOf(\Inertia\Response::class, $response);
        $response->assertInertia(fn (Assert $page) => $page
            ->has('meetings')
            ->where('meetings.0.id', $this->meeting->id)
        );
    }

    /** @test */
    public function mentor_can_store_meeting()
    {
        Auth::login($this->user);

        $request = Request::create('/classes/' . $this->class->id . '/meetings', 'POST', [
            'class_id' => $this->class->id,
            'title' => 'Test Meeting',
            'description' => 'Test Description',
            'materials' => [],
            'assignments' => [],
        ]);

        $response = $this->meetingController->store($request);

        $this->assertDatabaseHas('meetings', [
            'class_id' => $this->class->id,
            'title' => 'Test Meeting',
        ]);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function mentor_can_update_meeting()
    {
        Auth::login($this->user);

        $request = Request::create('/classes/' . $this->class->id . '/meetings/' . $this->meeting->id, 'POST', [
            'title' => 'Updated Meeting',
            'description' => 'Updated Description',
            'materials' => [],
            'assignments' => [],
            '_method' => 'PATCH',
        ]);

        $response = $this->meetingController->update($request, $this->class->id, $this->meeting->id);

        $this->assertDatabaseHas('meetings', [
            'id' => $this->meeting->id,
            'title' => 'Updated Meeting',
        ]);

        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function mentor_can_destroy_meeting()
    {
        Auth::login($this->user);

        $response = $this->meetingController->destroy($this->class->id, $this->meeting->id);

        $this->assertDatabaseMissing('meetings', ['id' => $this->meeting->id]);
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function student_cannot_store_meeting()
    {
        $student = User::factory()->create(['role' => 'student']);
        Auth::login($student);

        $request = Request::create('/classes/' . $this->class->id . '/meetings', 'POST', [
            'class_id' => $this->class->id,
            'title' => 'Test Meeting',
            'description' => 'Test Description',
        ]);

        $response = $this->meetingController->store($request);

        $this->assertDatabaseMissing('meetings', ['title' => 'Test Meeting']);
        // Should redirect back with errors or forbidden
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function admin_can_store_meeting()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Auth::login($admin);

        $request = Request::create('/classes/' . $this->class->id . '/meetings', 'POST', [
            'class_id' => $this->class->id,
            'title' => 'Admin Meeting',
            'description' => 'Admin Description',
            'materials' => [],
            'assignments' => [],
        ]);

        $response = $this->meetingController->store($request);

        $this->assertDatabaseHas('meetings', ['title' => 'Admin Meeting']);
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function update_meeting_with_materials_and_assignments()
    {
        Auth::login($this->user);

        $request = Request::create('/classes/' . $this->class->id . '/meetings/' . $this->meeting->id, 'POST', [
            'title' => 'Updated Meeting',
            'description' => 'Updated Description',
            'materials' => [
                ['link' => 'http://example.com/material1'],
                ['link' => 'http://example.com/material2'],
            ],
            'assignments' => [
                [
                    'title' => 'Test Assignment',
                    'description' => 'Test Desc',
                    'date_open' => '2024-01-01',
                    'time_open' => '08:00',
                    'date_close' => '2024-01-02',
                    'time_close' => '17:00',
                    'file_link' => 'http://example.com/file',
                ],
            ],
            '_method' => 'PATCH',
        ]);

        $response = $this->meetingController->update($request, $this->class->id, $this->meeting->id);

        $this->assertDatabaseHas('materials', [
            'meeting_id' => $this->meeting->id,
            'link' => 'http://example.com/material1',
        ]);

        $this->assertDatabaseHas('assignments', [
            'meeting_id' => $this->meeting->id,
            'title' => 'Test Assignment',
        ]);

        $this->assertEquals(302, $response->getStatusCode());
    }
}
