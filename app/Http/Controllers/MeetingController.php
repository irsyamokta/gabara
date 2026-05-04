<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Material;
use App\Models\Assignment;
use App\Helpers\ValidationHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller
{
    public function index($classId)
    {
        $meetings = Meeting::where('class_id', $classId)
            ->with(['materials', 'assignments'])
            ->get();

        return Inertia::render('Classes/Show', [
            'meetings' => $meetings,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $data['materials'] = $request->input('materials', []);
        $data['assignments'] = $request->input('assignments', []);
        $validator = ValidationHelper::meeting($data);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        return DB::transaction(function () use ($request) {
            $meeting = Meeting::create([
                'class_id' => $request->class_id,
                'title' => $request->title,
                'description' => $request->description,
            ]);

            $materials = $request->input('materials', []);
            foreach ($materials as $materialData) {
                if (!empty($materialData['link'])) {
                    Material::create([
                        'meeting_id' => $meeting->id,
                        'link' => $materialData['link'],
                    ]);
                }
            }

            $assignments = $request->input('assignments', []);
            foreach ($assignments as $assignmentData) {
                if (!empty($assignmentData['title'])) {
                    Assignment::create([
                        'meeting_id' => $meeting->id,
                        'title' => $assignmentData['title'],
                        'description' => $assignmentData['description'],
                        'date_open' => $assignmentData['date_open'],
                        'time_open' => $assignmentData['time_open'],
                        'date_close' => $assignmentData['date_close'],
                        'time_close' => $assignmentData['time_close'],
                        'file_link' => $assignmentData['file_link'] ?? null,
                    ]);
                }
            }

            return redirect()->back()->with('success', 'Pertemuan berhasil ditambahkan.');
        });
    }

    public function update(Request $request, $classId, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $data = $request->all();
        $data['materials'] = $request->input('materials', []);
        $data['assignments'] = $request->input('assignments', []);
        $validator = ValidationHelper::meeting($data, true, $meetingId);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        return DB::transaction(function () use ($request, $meeting) {
            $meeting->update([
                'title' => $request->title,
                'description' => $request->description,
            ]);

            $materials = $request->input('materials', []);
            $materialIds = collect($materials)
                ->pluck('id')
                ->filter()
                ->toArray();

            $meeting->materials()
                ->whereNotIn('id', $materialIds)
                ->delete();

            foreach ($materials as $materialData) {
                if (!empty($materialData['id'])) {
                    $material = Material::find($materialData['id']);
                    if ($material) {
                        $material->update([
                            'link' => $materialData['link'],
                        ]);
                    }
                } else {
                    if (!empty($materialData['link'])) {
                        Material::create([
                            'meeting_id' => $meeting->id,
                            'link'       => $materialData['link'],
                        ]);
                    }
                }
            }

            $assignments = $request->input('assignments', []);
            $assignmentIds = collect($assignments)
                ->pluck('id')
                ->filter()
                ->toArray();

            $meeting->assignments()
                ->whereNotIn('id', $assignmentIds)
                ->delete();

            foreach ($assignments as $assignmentData) {
                if (!empty($assignmentData['id'])) {
                    $assignment = Assignment::find($assignmentData['id']);
                    if ($assignment) {
                        $assignment->update([
                            'title'       => $assignmentData['title'],
                            'description' => $assignmentData['description'],
                            'date_open'   => $assignmentData['date_open'],
                            'time_open'   => $assignmentData['time_open'],
                            'date_close'  => $assignmentData['date_close'],
                            'time_close'  => $assignmentData['time_close'],
                            'file_link'   => $assignmentData['file_link'] ?? null,
                        ]);
                    }
                } else {
                    if (!empty($assignmentData['title'])) {
                        Assignment::create([
                            'meeting_id'  => $meeting->id,
                            'title'       => $assignmentData['title'],
                            'description' => $assignmentData['description'],
                            'date_open'   => $assignmentData['date_open'],
                            'time_open'   => $assignmentData['time_open'],
                            'date_close'  => $assignmentData['date_close'],
                            'time_close'  => $assignmentData['time_close'],
                            'file_link'   => $assignmentData['file_link'] ?? null,
                        ]);
                    }
                }
            }

            return redirect()->back()->with('success', 'Pertemuan berhasil diperbarui.');
        });
    }

    public function destroy($classId, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $meeting->delete();

        return redirect()->back()->with('success', 'Pertemuan berhasil dihapus.');
    }
}
